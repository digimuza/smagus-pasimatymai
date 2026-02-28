"use client";

import {
	motion,
	type PanInfo,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cardSwipe } from "@/lib/animations";
import { SWIPE_THRESHOLD } from "@/lib/constants";
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
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const [exitX, setExitX] = useState(0);
	const [exitY, setExitY] = useState(0);

	const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
	const opacity = useTransform(
		x,
		[-200, -100, 0, 100, 200],
		[0.5, 1, 1, 1, 0.5],
	);

	const handleDragEnd = (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) => {
		const { offset, velocity } = info;

		if (offset.y < -SWIPE_THRESHOLD || velocity.y < -500) {
			setExitY(-500);
			return;
		}

		if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
			if (offset.x < 0) {
				setExitX(-500);
			} else {
				setExitX(500);
			}
		}
	};

	return (
		<motion.div
			animate={
				exitX !== 0 || exitY !== 0
					? { opacity: 0, transition: { duration: 0.3 }, x: exitX, y: exitY }
					: cardSwipe.animate
			}
			className="absolute h-96 w-full max-w-md cursor-grab rounded-2xl bg-gradient-to-br from-background-light to-background-lighter p-8 shadow-lg active:cursor-grabbing"
			drag
			dragConstraints={{ bottom: 0, left: 0, right: 0, top: 0 }}
			dragElastic={0.7}
			initial={cardSwipe.initial}
			key={question.id}
			onAnimationComplete={() => {
				if (exitX !== 0 || exitY !== 0) {
					if (exitY < 0) onSwipeUp();
					else if (exitX < 0) onSwipeLeft();
					else if (exitX > 0) onSwipeRight();
				}
			}}
			onDragEnd={handleDragEnd}
			style={{ opacity, rotateZ, x, y }}
			transition={cardSwipe.transition}
		>
			<div className="flex h-full items-center justify-center">
				<p className="text-balance text-center font-light text-2xl text-text leading-relaxed md:text-3xl">
					{question.question}
				</p>
			</div>

			<motion.div
				className="absolute top-8 left-8 rotate-[-15deg] font-bold text-accent text-xl opacity-0"
				style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
			>
				{t("swipeSkip")}
			</motion.div>

			<motion.div
				className="absolute top-8 right-8 rotate-[15deg] font-bold text-primary text-xl opacity-0"
				style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
			>
				{t("swipeAnswered")}
			</motion.div>

			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 font-bold text-primary-light text-xl opacity-0"
				style={{ opacity: useTransform(y, [-150, -50], [1, 0]) }}
			>
				{t("swipeSuper")}
			</motion.div>
		</motion.div>
	);
}
