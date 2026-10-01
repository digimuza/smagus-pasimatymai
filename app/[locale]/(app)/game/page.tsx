"use client";

import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
		activeCategories,
		sections,
		audience,
		isContentLimited,
		showPaywall,
		setShowPaywall,
	} = useQuestions();
	const { vibrate } = useHaptic();
	const { isAuthenticated, updateStreak } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const streakUpdatedRef = useRef(false);

	useEffect(() => {
		if (!audience) {
			router.push("/audience");
		}
	}, [audience, router]);

	// Update streak when game starts
	useEffect(() => {
		if (audience && isAuthenticated && !streakUpdatedRef.current) {
			streakUpdatedRef.current = true;
			updateStreak();
		}
	}, [audience, isAuthenticated, updateStreak]);

	useEffect(() => {
		if (
			audience &&
			sections.length > 0 &&
			activeCategories.length > 0 &&
			availableQuestionsCount === 0
		) {
			if (isContentLimited) {
				setShowPaywall(true);
			} else {
				router.push("/awesome");
			}
		}
	}, [
		audience,
		availableQuestionsCount,
		activeCategories.length,
		sections.length,
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
		<PageLayout className="game-atmosphere">
			<Header
				className="!bg-transparent border-white/10 border-b px-5 py-5 sm:px-8"
				leftAction={
					<button
						aria-label={t("common.openMenu")}
						className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#f0d5dc] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9]"
						onClick={() => setIsSidebarOpen(true)}
						type="button"
					>
						<svg
							className="h-6 w-6"
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
						<span aria-hidden="true" className="text-xl">
							{currentAudience?.icon}
						</span>
					</div>
				}
				title={t("common.appName")}
				titleClassName="font-serif !text-[#fff1e7] !text-xl sm:!text-2xl"
			/>

			<main className="relative flex flex-1 flex-col items-center justify-center px-5 py-8 sm:p-8">
				<div className="mb-5 flex w-full max-w-md items-center justify-between gap-3 text-sm">
					<span className="text-[#e8c7c9] text-xs uppercase tracking-[0.16em]">
						{t("game.conversationPrompt")}
					</span>
					<span className="shrink-0 rounded-full border border-[#f5c7a9]/25 bg-[#f5c7a9]/10 px-3 py-1 text-[#f4c8ae] text-xs">
						{t("game.remaining", { count: availableQuestionsCount })}
					</span>
				</div>
				<div className="relative mb-8 h-[min(23rem,42vh)] min-h-60 w-full max-w-md">
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

				<div className="grid w-full max-w-md grid-cols-3 gap-3 text-center text-sm">
					<button
						className="min-h-14 rounded-full border border-white/15 bg-white/5 px-2 py-4 font-medium text-[#e9d0db] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] disabled:opacity-40"
						disabled={!currentQuestion || !!currentSpicyCard}
						onClick={handleSwipeLeft}
						type="button"
					>
						<span aria-hidden="true" className="mr-1">
							←
						</span>{" "}
						{t("game.skip")}
					</button>
					<button
						className="min-h-14 rounded-full border border-[#f5c7a9]/30 bg-[#f5c7a9]/10 px-2 py-4 font-medium text-[#f5c7a9] transition-colors hover:bg-[#f5c7a9]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] disabled:opacity-40"
						disabled={!currentQuestion || !!currentSpicyCard}
						onClick={handleSwipeUp}
						type="button"
					>
						<span aria-hidden="true" className="mr-1">
							☆
						</span>{" "}
						{t("game.super")}
					</button>
					<button
						className="min-h-14 rounded-full bg-[#f5c7a9] px-2 py-4 font-semibold text-[#281827] shadow-[0_12px_30px_rgba(245,165,153,0.18)] transition-colors hover:bg-[#ffe0c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40"
						disabled={!currentQuestion || !!currentSpicyCard}
						onClick={handleSwipeRight}
						type="button"
					>
						{t("game.answered")} <span aria-hidden="true">→</span>
					</button>
				</div>
				<p className="mt-7 max-w-md text-center font-serif text-[#d1b3c2] text-base italic">
					{t("game.takeYourTime")}
				</p>
			</main>

			<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
			<Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
		</PageLayout>
	);
}
