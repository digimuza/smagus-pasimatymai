"use client";

import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CardDeck } from "@/components/CardDeck";
import { Paywall } from "@/components/payments/Paywall";
import { Sidebar } from "@/components/Sidebar";
import { SpicyCardDisplay } from "@/components/SpicyCardDisplay";
import { StreakBadge } from "@/components/StreakBadge";
import { Header, PageLayout } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useHaptic } from "@/hooks/useHaptic";
import { useRouter } from "@/i18n/navigation";
import { getPreviewQuestions, getQuestionSection } from "@/lib/questionEngine";
import { AUDIENCE_DEFAULTS } from "@/types/audience";

export default function GamePage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const {
		currentQuestion,
		currentSpicyCard,
		skipQuestion,
		answerQuestion,
		superlikeQuestion,
		dismissSpicyCard,
		availableQuestionsCount,
		audience,
		isContentLimited,
		showPaywall,
		setShowPaywall,
		sections,
		activeCategories,
		questionStates,
		superlikedQuestions,
	} = useQuestions();
	const { vibrate } = useHaptic();
	const { isAuthenticated, updateStreak } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const streakUpdatedRef = useState(false);

	useEffect(() => {
		if (!audience) {
			router.push("/audience");
		}
	}, [audience, router]);

	// Update streak when game starts
	useEffect(() => {
		if (audience && isAuthenticated && !streakUpdatedRef[0]) {
			streakUpdatedRef[1](true);
			updateStreak();
		}
	}, [audience, isAuthenticated, updateStreak, streakUpdatedRef]);

	useEffect(() => {
		if (audience && availableQuestionsCount === 0) {
			if (isContentLimited) {
				setShowPaywall(true);
			} else {
				router.push("/awesome");
			}
		}
	}, [
		audience,
		availableQuestionsCount,
		isContentLimited,
		setShowPaywall,
		router,
	]);

	// Derive section info for the current question
	const currentSection = useMemo(() => {
		if (!currentQuestion) return null;
		return getQuestionSection(sections, currentQuestion.id);
	}, [currentQuestion, sections]);

	// Collect the next few questions for the deck stack visual
	const previewQuestions = useMemo(() => {
		if (!currentQuestion) return [];
		return getPreviewQuestions(
			sections,
			activeCategories,
			questionStates,
			currentQuestion.id,
			3,
		);
	}, [currentQuestion, sections, activeCategories, questionStates]);

	const currentAudience = AUDIENCE_DEFAULTS.find((a) => a.slug === audience);

	const handleSwipeLeft = () => {
		vibrate("light");
		skipQuestion();
	};

	const handleSwipeRight = () => {
		vibrate("medium");
		answerQuestion();
	};

	const handleSwipeUp = () => {
		vibrate("heavy");
		superlikeQuestion();
	};

	return (
		<PageLayout>
			<Header
				leftAction={
					<button
						aria-label={t("common.openMenu")}
						className="text-text-muted transition-colors hover:text-text"
						onClick={() => setIsSidebarOpen(true)}
						type="button"
					>
						<svg
							className="h-8 w-8"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M4 6h16M4 12h16M4 18h16"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</button>
				}
				rightAction={
					<div className="flex items-center gap-2">
						{superlikedQuestions.length > 0 && (
							<button
								aria-label={t("awesome.title")}
								className="relative text-text-muted transition-colors hover:text-warning"
								onClick={() => router.push("/awesome")}
								type="button"
							>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
								</svg>
								<span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning font-bold text-background text-xs leading-none">
									{superlikedQuestions.length > 9
										? "9+"
										: superlikedQuestions.length}
								</span>
							</button>
						)}
						<StreakBadge />
						<span className="text-xl">{currentAudience?.icon}</span>
					</div>
				}
				title={t("common.appName")}
			/>

			<main className="relative flex flex-1 flex-col items-center justify-center p-6">
				<div className="mb-12 w-full max-w-md">
					<AnimatePresence mode="wait">
						{currentSpicyCard ? (
							<SpicyCardDisplay
								card={currentSpicyCard}
								key={currentSpicyCard.id}
								onDismiss={dismissSpicyCard}
							/>
						) : (
							<CardDeck
								category={currentSection?.name}
								difficulty={currentSection?.type}
								key="deck"
								onSwipeLeft={handleSwipeLeft}
								onSwipeRight={handleSwipeRight}
								onSwipeUp={handleSwipeUp}
								previewQuestions={previewQuestions}
								question={currentQuestion}
							/>
						)}
					</AnimatePresence>
				</div>

				<div className="grid w-full max-w-md grid-cols-3 gap-4 text-center text-sm">
					<div className="space-y-1">
						<div className="text-2xl text-accent">&larr;</div>
						<p className="text-text-muted">{t("game.skip")}</p>
					</div>
					<div className="space-y-1">
						<div className="text-2xl text-primary-light">&uarr;</div>
						<p className="text-text-muted">{t("game.super")}</p>
					</div>
					<div className="space-y-1">
						<div className="text-2xl text-primary">&rarr;</div>
						<p className="text-text-muted">{t("game.answered")}</p>
					</div>
				</div>

				<div
					className="mt-8 text-sm text-text-dimmed"
					data-testid="question-count"
				>
					{t("game.remaining", { count: availableQuestionsCount })}
				</div>
			</main>

			<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
			<Paywall
				isOpen={showPaywall}
				onClose={() => setShowPaywall(false)}
				trigger="question_limit"
			/>
		</PageLayout>
	);
}
