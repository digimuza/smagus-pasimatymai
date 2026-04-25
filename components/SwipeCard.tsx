"use client";

import { motion, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { cardSwipe } from "@/lib/animations";
import type { Question } from "@/types";

interface SwipeCardProps {
	category?: string;
	difficulty?: "safe" | "intimate";
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
	onSwipeUp: () => void;
	question: Question;
}

export function SwipeCard({
	question,
	category,
	difficulty,
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
}: SwipeCardProps) {
	const t = useTranslations("game");
	const { dragHandlers, exitAnimate, isDismissed, x, y, rotateZ, cardOpacity, triggerSwipe } =
		useSwipeGesture({
			enabledDirections: ["left", "right", "up"],
			onSwipeLeft,
			onSwipeRight,
			onSwipeUp,
		});

	// Colour overlays: red=skip, green=answer, yellow=super
	const skipOverlayOpacity = useTransform(x, [-150, -50], [0.45, 0]);
	const answerOverlayOpacity = useTransform(x, [50, 150], [0, 0.45]);
	const superOverlayOpacity = useTransform(y, [-150, -50], [0.45, 0]);

	// Label visibility
	const leftLabelOpacity = useTransform(x, [-150, -50], [1, 0]);
	const rightLabelOpacity = useTransform(x, [50, 150], [0, 1]);
	const upLabelOpacity = useTransform(y, [-150, -50], [1, 0]);

	const hasBadges = category || difficulty;

	return (
		<motion.div
			{...dragHandlers}
			animate={isDismissed ? (exitAnimate ?? undefined) : cardSwipe.animate}
			className="absolute inset-0 cursor-grab overflow-hidden rounded-2xl bg-gradient-to-br from-background-light to-background-lighter shadow-lg active:cursor-grabbing"
			data-question-id={question.id}
			data-testid="swipe-card"
			initial={cardSwipe.initial}
			key={question.id}
			style={{ opacity: cardOpacity, rotateZ, x, y, zIndex: 20 }}
			transition={cardSwipe.transition}
		>
			{/* Directional colour overlays */}
			<motion.div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={{ backgroundColor: "#fb7185", opacity: skipOverlayOpacity }}
			/>
			<motion.div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={{ backgroundColor: "#34d399", opacity: answerOverlayOpacity }}
			/>
			<motion.div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={{ backgroundColor: "#fbbf24", opacity: superOverlayOpacity }}
			/>

			{/* Category and difficulty badges */}
			{hasBadges && (
				<div className="absolute top-4 left-4 right-4 flex items-center justify-between">
					{category ? (
						<Badge size="sm" variant="default">
							{category}
						</Badge>
					) : (
						<span />
					)}
					{difficulty && (
						<Badge
							size="sm"
							variant={difficulty === "intimate" ? "warning" : "success"}
						>
							{t(
								difficulty === "intimate"
									? "difficultyIntimate"
									: "difficultySafe",
							)}
						</Badge>
					)}
				</div>
			)}

			{/* Question text — padded to avoid overlap with badges/labels */}
			<div
				className={`flex h-full items-center justify-center px-8 ${hasBadges ? "pt-14 pb-10" : "p-8"}`}
			>
				<p className="text-balance text-center font-light text-2xl text-text leading-relaxed md:text-3xl">
					{question.question}
				</p>
			</div>

			{/* Swipe direction labels */}
			<motion.div
				className="absolute top-8 left-8 rotate-[-15deg] font-bold text-accent text-xl"
				style={{ opacity: leftLabelOpacity }}
			>
				{t("swipeSkip")}
			</motion.div>

			<motion.div
				className="absolute top-8 right-8 rotate-[15deg] font-bold text-success text-xl"
				style={{ opacity: rightLabelOpacity }}
			>
				{t("swipeAnswered")}
			</motion.div>

			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 font-bold text-warning text-xl"
				style={{ opacity: upLabelOpacity }}
			>
				{t("swipeSuper")}
			</motion.div>

			{/* Star tap button — alternative to swipe up */}
			<motion.button
				aria-label={t("swipeSuper")}
				className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/40 text-warning/60 backdrop-blur-sm transition-colors hover:bg-background/60 hover:text-warning active:scale-95"
				onClick={() => triggerSwipe("up")}
				onPointerDown={(e) => e.stopPropagation()}
				type="button"
			>
				<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
			</motion.button>
		</motion.div>
	);
}
