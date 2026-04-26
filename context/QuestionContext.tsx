"use client";

import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { trackEvent } from "@/lib/analytics";
import { STORAGE_KEY } from "@/lib/constants";
import {
	getAvailableQuestionsCount,
	getNextQuestion,
	getSuperlikedQuestions,
} from "@/lib/questionEngine";
import { DEFAULT_SPICY_SETTINGS } from "@/lib/spicyCardsData";
import { canAccessSpicyCards, getQuestionLimit } from "@/lib/subscription";
import type {
	QuestionContextType,
	QuestionData,
	QuestionState,
	Section,
} from "@/types";
import {
	RARITY_PROBABILITIES,
	type SpicyCard,
	type SpicyCardRarity,
} from "@/types/spicyCards";

const QuestionContext = createContext<QuestionContextType | undefined>(
	undefined,
);

export function QuestionProvider({ children }: { children: React.ReactNode }) {
	const locale = useLocale();
	const t = useTranslations("common");
	const { isAuthenticated, subscription } = useAuth();
	const [questionData, setQuestionData] = useState<QuestionData | null>(null);
	const [spicyCards, setSpicyCards] = useState<SpicyCard[]>([]);
	const [safeCategoryNames, setSafeCategoryNames] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showPaywall, setShowPaywall] = useState(false);

	const [state, setState, isStateLoaded] = useLocalStorage(STORAGE_KEY, {
		activeCategories: [] as string[],
		audience: null as string | null,
		currentQuestionId: null as number | null,
		inviteToken: null as string | null,
		pairedSessionId: null as string | null,
		questionStates: [] as QuestionState[],
		spicyCardsEnabled: DEFAULT_SPICY_SETTINGS.enabled,
		spicyCardsRarity: DEFAULT_SPICY_SETTINGS.rarity as SpicyCardRarity,
		spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes as readonly string[],
	});

	const [currentSpicyCard, setCurrentSpicyCard] = useState<SpicyCard | null>(
		null,
	);
	const questionViewedAt = useRef<number>(Date.now());

	// Initialize session tracking
	useSessionTracking({ audience: state.audience || "romantic", locale });

	// Two-way sync with server on first login: download server progress (cross-device),
	// then upload any local-only records so both sides converge.
	const syncedRef = useRef(false);
	useEffect(() => {
		if (!isAuthenticated || !state.audience || syncedRef.current) return;
		syncedRef.current = true;

		const audience = state.audience;
		const localProgress = state.questionStates;

		fetch(`/api/sessions/swipe?audience=${encodeURIComponent(audience)}`, {
			credentials: "include",
		})
			.then((res) => res.json())
			.then(
				(data: {
					responses: Array<{
						action: string;
						audience: string;
						questionId: number;
						timestamp: string;
					}>;
				}) => {
					const serverResponses = data.responses ?? [];
					const serverIds = new Set(serverResponses.map((r) => r.questionId));

					// Merge server-only records into local state
					if (serverResponses.length > 0) {
						setState((prev) => {
							const localIds = new Set(prev.questionStates.map((qs) => qs.id));
							const toAdd = serverResponses
								.filter((r) => !localIds.has(r.questionId))
								.map((r) => ({
									answeredAt: r.timestamp,
									id: r.questionId,
									status: r.action as QuestionState["status"],
								}));
							if (toAdd.length === 0) return prev;
							return {
								...prev,
								questionStates: [...prev.questionStates, ...toAdd],
							};
						});
					}

					// Upload local-only records to server
					const localOnlyItems = localProgress
						.filter((qs) => !serverIds.has(qs.id) && qs.status !== "new")
						.map((qs) => ({
							audience,
							questionId: qs.id,
							status: qs.status === "new" ? "answered" : qs.status,
							viewedAt: qs.answeredAt,
						}));
					if (localOnlyItems.length > 0) {
						fetch("/api/progress", {
							body: JSON.stringify({ items: localOnlyItems }),
							credentials: "include",
							headers: { "Content-Type": "application/json" },
							method: "POST",
						}).catch(() => {});
					}
				},
			)
			.catch(() => {
				// Fallback: push local progress to server even if download failed
				if (localProgress.length === 0) return;
				const items = localProgress
					.filter((qs) => qs.status !== "new")
					.map((qs) => ({
						audience,
						questionId: qs.id,
						status: qs.status === "new" ? "answered" : qs.status,
						viewedAt: qs.answeredAt,
					}));
				if (items.length > 0) {
					fetch("/api/progress", {
						body: JSON.stringify({ items }),
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						method: "POST",
					}).catch(() => {});
				}
			});
	}, [isAuthenticated, state.audience, state.questionStates, setState]);

	// Load question data from API (gated on audience selection)
	useEffect(() => {
		if (!state.audience) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch(
			`/api/game-data?audience=${encodeURIComponent(state.audience)}&locale=${encodeURIComponent(locale)}`,
		)
			.then((res) => res.json())
			.then((data) => {
				const qData: QuestionData = {
					sections: data.sections,
					title: data.title,
					total_questions: data.total_questions,
				};
				setQuestionData(qData);

				// Set spicy cards from API
				if (data.spicyCards) {
					setSpicyCards(data.spicyCards);
				}

				// Derive safe categories from API data
				const safeNames = data.sections
					.filter((s: Section) => s.type === "safe")
					.map((s: Section) => s.name);
				setSafeCategoryNames(safeNames);

				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Failed to load questions:", error);
				setIsLoading(false);
			});
	}, [state.audience, locale]);

	// Initialize active categories once data loads and state is ready
	useEffect(() => {
		if (!questionData || !isStateLoaded || safeCategoryNames.length === 0)
			return;

		// If stored activeCategories is empty (first load), default to safe categories
		if (state.activeCategories.length === 0) {
			setState((prev) => ({ ...prev, activeCategories: safeCategoryNames }));
			return;
		}

		const validCategoryNames = questionData.sections.map((s) => s.name);
		const sanitized = Array.from(new Set(state.activeCategories)).filter(
			(cat) => validCategoryNames.includes(cat),
		);

		if (sanitized.length === 0) {
			setState((prev) => ({ ...prev, activeCategories: safeCategoryNames }));
		} else if (sanitized.length !== state.activeCategories.length) {
			setState((prev) => ({ ...prev, activeCategories: sanitized }));
		}
	}, [
		questionData,
		isStateLoaded,
		safeCategoryNames,
		state.activeCategories,
		setState,
	]);

	// Question limit based on subscription
	const questionLimit = useMemo(
		() => getQuestionLimit(subscription),
		[subscription],
	);

	// Get all questions (flattened from all sections, limited for free users)
	const allQuestions = useMemo(() => {
		if (!questionData) return [];
		const all = questionData.sections.flatMap((section) => section.questions);
		if (questionLimit === Infinity) return all;
		return all.slice(0, questionLimit);
	}, [questionData, questionLimit]);

	// Whether the user is seeing a limited set of content
	const isContentLimited = useMemo(() => {
		if (!questionData) return false;
		const totalAvailable = questionData.sections.flatMap(
			(s) => s.questions,
		).length;
		return totalAvailable > questionLimit;
	}, [questionData, questionLimit]);

	// Get current question
	const currentQuestion = useMemo(() => {
		if (!state.currentQuestionId) return null;
		return allQuestions.find((q) => q.id === state.currentQuestionId) || null;
	}, [allQuestions, state.currentQuestionId]);

	// Get superliked questions
	const superlikedQuestions = useMemo(() => {
		return getSuperlikedQuestions(allQuestions, state.questionStates);
	}, [allQuestions, state.questionStates]);

	// Get available questions count
	const availableQuestionsCount = useMemo(() => {
		if (!questionData) return 0;
		return getAvailableQuestionsCount(
			questionData.sections,
			state.activeCategories,
			state.questionStates,
		);
	}, [questionData, state.activeCategories, state.questionStates]);

	// Get random spicy card
	const getRandomSpicyCard = useCallback((): SpicyCard | null => {
		const enabledCards = spicyCards.filter((card) =>
			state.spicyCardTypes?.includes(card.type),
		);

		if (enabledCards.length === 0) return null;

		const randomIndex = Math.floor(Math.random() * enabledCards.length);
		return enabledCards[randomIndex];
	}, [spicyCards, state.spicyCardTypes]);

	// Check if should show spicy card (probability-based, premium only)
	const shouldShowSpicyCard = useCallback(() => {
		if (!canAccessSpicyCards(subscription)) return false;
		if (!state.spicyCardsEnabled) return false;
		if (!state.spicyCardsRarity) return false;

		const probability =
			RARITY_PROBABILITIES[
				state.spicyCardsRarity as keyof typeof RARITY_PROBABILITIES
			] || 0.3;
		const randomValue = Math.random();

		return randomValue < probability;
	}, [subscription, state.spicyCardsEnabled, state.spicyCardsRarity]);

	// Load next question when needed
	const loadNextQuestion = useCallback(() => {
		if (!questionData) return;

		// Check if we should show a spicy card instead (probability-based)
		if (shouldShowSpicyCard()) {
			const spicyCard = getRandomSpicyCard();
			if (spicyCard) {
				setCurrentSpicyCard(spicyCard);
				setState((prev) => ({
					...prev,
					currentQuestionId: null,
				}));
				questionViewedAt.current = Date.now();
				return;
			}
		}

		const nextQuestion = getNextQuestion(
			questionData.sections,
			state.activeCategories,
			state.questionStates,
		);

		setCurrentSpicyCard(null);
		setState((prev) => ({
			...prev,
			currentQuestionId: nextQuestion?.id || null,
		}));

		if (nextQuestion) {
			trackEvent("viewed", nextQuestion.id);
			questionViewedAt.current = Date.now();
		}
	}, [
		questionData,
		state.activeCategories,
		state.questionStates,
		setState,
		shouldShowSpicyCard,
		getRandomSpicyCard,
	]);

	// Load initial question
	useEffect(() => {
		if (
			isStateLoaded &&
			!isLoading &&
			!currentQuestion &&
			!currentSpicyCard &&
			availableQuestionsCount > 0
		) {
			loadNextQuestion();
		}
	}, [
		isStateLoaded,
		isLoading,
		currentQuestion,
		currentSpicyCard,
		availableQuestionsCount,
		loadNextQuestion,
	]);

	// Update question state
	const updateQuestionState = useCallback(
		(questionId: number, status: QuestionState["status"]) => {
			const answeredAt = new Date().toISOString();

			setState((prev) => {
				const existingIndex = prev.questionStates.findIndex(
					(qs) => qs.id === questionId,
				);
				const newQuestionStates = [...prev.questionStates];

				if (existingIndex >= 0) {
					newQuestionStates[existingIndex] = {
						answeredAt,
						id: questionId,
						status,
					};
				} else {
					newQuestionStates.push({ answeredAt, id: questionId, status });
				}

				return { ...prev, questionStates: newQuestionStates };
			});

			// Sync to server if authenticated
			if (isAuthenticated && state.audience) {
				fetch("/api/progress", {
					body: JSON.stringify({
						items: [
							{
								audience: state.audience,
								questionId,
								status: status === "new" ? "answered" : status,
								viewedAt: answeredAt,
							},
						],
					}),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "POST",
				}).catch(() => {});
			}

			// Load next question after updating state
			setTimeout(loadNextQuestion, 0);
		},
		[setState, loadNextQuestion, isAuthenticated, state.audience],
	);

	// Actions
	const skipQuestion = useCallback(() => {
		if (!currentQuestion) return;
		const timeSpent = Date.now() - questionViewedAt.current;
		trackEvent("skipped", currentQuestion.id, timeSpent);
		updateQuestionState(currentQuestion.id, "skipped");
	}, [currentQuestion, updateQuestionState]);

	const answerQuestion = useCallback(() => {
		if (!currentQuestion) return;
		const timeSpent = Date.now() - questionViewedAt.current;
		trackEvent("answered", currentQuestion.id, timeSpent);
		updateQuestionState(currentQuestion.id, "answered");
	}, [currentQuestion, updateQuestionState]);

	const superlikeQuestion = useCallback(() => {
		if (!currentQuestion) return;
		const timeSpent = Date.now() - questionViewedAt.current;
		trackEvent("superliked", currentQuestion.id, timeSpent);
		updateQuestionState(currentQuestion.id, "superliked");
	}, [currentQuestion, updateQuestionState]);

	const toggleCategory = useCallback(
		(categoryName: string) => {
			setState((prev) => {
				const isActive = prev.activeCategories.includes(categoryName);

				// Prevent deselecting the last category
				if (isActive && prev.activeCategories.length === 1) {
					return prev;
				}

				const newCategories = isActive
					? prev.activeCategories.filter((cat) => cat !== categoryName)
					: [...prev.activeCategories, categoryName];

				return {
					...prev,
					activeCategories: newCategories,
				};
			});

			// Reload question after category change
			setTimeout(loadNextQuestion, 0);
		},
		[setState, loadNextQuestion],
	);

	const isCategoryActive = useCallback(
		(categoryName: string) => {
			return state.activeCategories.includes(categoryName);
		},
		[state.activeCategories],
	);

	const dismissSpicyCard = useCallback(() => {
		if (currentSpicyCard) {
			trackEvent("spicy_dismissed", currentSpicyCard.id);
		}
		setCurrentSpicyCard(null);
		setTimeout(loadNextQuestion, 0);
	}, [currentSpicyCard, loadNextQuestion]);

	const toggleSpicyCards = useCallback(
		(enabled: boolean) => {
			setState((prev) => ({
				...prev,
				spicyCardsEnabled: enabled,
			}));
		},
		[setState],
	);

	const updateSpicyCardsRarity = useCallback(
		(rarity: SpicyCardRarity | string) => {
			setState((prev) => ({
				...prev,
				spicyCardsRarity: rarity as SpicyCardRarity,
			}));
		},
		[setState],
	);

	const toggleSpicyCardType = useCallback(
		(type: string) => {
			setState((prev) => {
				const types = prev.spicyCardTypes || [];
				const hasType = types.includes(type);

				// Don't allow removing the last type
				if (hasType && types.length === 1) {
					return prev;
				}

				return {
					...prev,
					spicyCardTypes: hasType
						? types.filter((t) => t !== type)
						: [...types, type],
				};
			});
		},
		[setState],
	);

	const setAudience = useCallback(
		(slug: string) => {
			setState((prev) => ({
				...prev,
				activeCategories: [],
				audience: slug,
				currentQuestionId: null,
				questionStates: [],
			}));
			setQuestionData(null);
			setSpicyCards([]);
			setSafeCategoryNames([]);
			setCurrentSpicyCard(null);
		},
		[setState],
	);

	const setPairedSession = useCallback(
		(sessionId: string, token: string) => {
			setState((prev) => ({
				...prev,
				inviteToken: token,
				pairedSessionId: sessionId,
			}));
		},
		[setState],
	);

	const clearPairedSession = useCallback(() => {
		setState((prev) => ({
			...prev,
			inviteToken: null,
			pairedSessionId: null,
		}));
	}, [setState]);

	const resetProgress = useCallback(() => {
		setState((prev) => ({
			...prev,
			activeCategories: safeCategoryNames.length > 0 ? safeCategoryNames : [],
			currentQuestionId: null,
			questionStates: [],
			spicyCardsEnabled: DEFAULT_SPICY_SETTINGS.enabled,
			spicyCardsRarity: DEFAULT_SPICY_SETTINGS.rarity,
			spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes,
		}));
		setCurrentSpicyCard(null);
		setTimeout(loadNextQuestion, 0);
	}, [setState, loadNextQuestion, safeCategoryNames]);

	const value: QuestionContextType = {
		activeCategories: state.activeCategories,
		answerQuestion,
		audience: state.audience || null,
		availableQuestionsCount,
		clearPairedSession,
		currentQuestion,
		currentSpicyCard,
		dismissSpicyCard,
		enabledSpicyCardTypes: (state.spicyCardTypes ||
			DEFAULT_SPICY_SETTINGS.enabledTypes) as string[],
		inviteToken: state.inviteToken ?? null,
		isCategoryActive,
		isContentLimited,
		pairedSessionId: state.pairedSessionId ?? null,
		questionStates: state.questionStates,
		questions: allQuestions,
		resetProgress,
		sections: questionData?.sections || [],
		setAudience,
		setPairedSession,
		setShowPaywall,
		showPaywall,
		skipQuestion,
		spicyCardsEnabled: state.spicyCardsEnabled || false,
		spicyCardsRarity: state.spicyCardsRarity || DEFAULT_SPICY_SETTINGS.rarity,
		superlikedQuestions,
		superlikeQuestion,
		toggleCategory,
		toggleSpicyCards,
		toggleSpicyCardType,
		updateQuestionState,
		updateSpicyCardsRarity,
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-primary text-xl">{t("loading")}</div>
			</div>
		);
	}

	return (
		<QuestionContext.Provider value={value}>
			{children}
		</QuestionContext.Provider>
	);
}

export function useQuestions() {
	const context = useContext(QuestionContext);
	if (context === undefined) {
		throw new Error("useQuestions must be used within a QuestionProvider");
	}
	return context;
}
