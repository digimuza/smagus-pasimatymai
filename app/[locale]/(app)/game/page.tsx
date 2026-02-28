"use client";

import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Paywall } from "@/components/payments/Paywall";
import { Sidebar } from "@/components/Sidebar";
import { SpicyCardDisplay } from "@/components/SpicyCardDisplay";
import { StreakBadge } from "@/components/StreakBadge";
import { SwipeCard } from "@/components/SwipeCard";
import { Header, PageLayout } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useHaptic } from "@/hooks/useHaptic";
import { useRouter } from "@/i18n/navigation";
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
						<StreakBadge />
						<span className="text-xl">{currentAudience?.icon}</span>
					</div>
				}
				title={t("common.appName")}
			/>

			<main className="relative flex flex-1 flex-col items-center justify-center p-6">
				<div className="relative mb-12 h-96 w-full max-w-md">
					<AnimatePresence mode="wait">
						{currentSpicyCard ? (
							<SpicyCardDisplay
								card={currentSpicyCard}
								key={currentSpicyCard.id}
								onDismiss={dismissSpicyCard}
							/>
						) : currentQuestion ? (
							<SwipeCard
								key={currentQuestion.id}
								onSwipeLeft={handleSwipeLeft}
								onSwipeRight={handleSwipeRight}
								onSwipeUp={handleSwipeUp}
								question={currentQuestion}
							/>
						) : null}
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

				<div className="mt-8 text-sm text-text-dimmed">
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
