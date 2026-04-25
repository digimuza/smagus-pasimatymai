"use client";

import { motion, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { cardSwipe } from "@/lib/animations";
import type { Question } from "@/types";

interface SwipeCardProps {
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
	onSwipeUp: () => void;
	question: Question;
}

export function SwipeCard({
	question,
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
}: SwipeCardProps) {
	const t = useTranslations("game");
	const { dragHandlers, exitAnimate, isDismissed, x, y, rotateZ, cardOpacity } =
		useSwipeGesture({
			enabledDirections: ["left", "right", "up"],
			onSwipeLeft,
			onSwipeRight,
			onSwipeUp,
		});

	const leftLabelOpacity = useTransform(x, [-150, -50], [1, 0]);
	const rightLabelOpacity = useTransform(x, [50, 150], [0, 1]);
	const upLabelOpacity = useTransform(y, [-150, -50], [1, 0]);

	return (
		<motion.div
			{...dragHandlers}
			animate={isDismissed ? (exitAnimate ?? undefined) : cardSwipe.animate}
			className="absolute h-96 w-full max-w-md cursor-grab rounded-2xl bg-gradient-to-br from-background-light to-background-lighter p-8 shadow-lg active:cursor-grabbing"
			initial={cardSwipe.initial}
			key={question.id}
			style={{ opacity: cardOpacity, rotateZ, x, y }}
			transition={cardSwipe.transition}
		>
			<div className="flex h-full items-center justify-center">
				<p className="text-balance text-center font-light text-2xl text-text leading-relaxed md:text-3xl">
					{question.question}
				</p>
			</div>

			<motion.div
				className="absolute top-8 left-8 rotate-[-15deg] font-bold text-accent text-xl opacity-0"
				style={{ opacity: leftLabelOpacity }}
			>
				{t("swipeSkip")}
			</motion.div>

			<motion.div
				className="absolute top-8 right-8 rotate-[15deg] font-bold text-primary text-xl opacity-0"
				style={{ opacity: rightLabelOpacity }}
			>
				{t("swipeAnswered")}
			</motion.div>

			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 font-bold text-primary-light text-xl opacity-0"
				style={{ opacity: upLabelOpacity }}
			>
				{t("swipeSuper")}
			</motion.div>
		</motion.div>
	);
}
