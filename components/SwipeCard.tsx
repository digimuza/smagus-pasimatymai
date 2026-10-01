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
		_event: MouseEvent | TouchEvent | PointerEvent,
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
			className="paper-card absolute h-full w-full max-w-md cursor-grab overflow-hidden rounded-[1.8rem] border border-[#fff8ea] p-6 text-[#382838] shadow-[0_28px_60px_rgba(0,0,0,0.35)] active:cursor-grabbing sm:p-8"
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
			<div
				aria-hidden="true"
				className="absolute inset-3 rounded-[1.3rem] border border-[#a88686]/25"
			/>
			<div className="absolute top-7 right-8 left-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
				<span>{t("conversationPrompt")}</span>
				<span
					aria-hidden="true"
					className="font-serif text-[#a76773] text-xl leading-none"
				>
					✦
				</span>
			</div>
			<div className="flex h-full items-center justify-center px-1 pt-6 pb-4">
				<p className="text-balance text-center font-serif text-[#39283b] text-[1.8rem] leading-[1.25] md:text-[2.15rem]">
					{question.question}
				</p>
			</div>
			<div
				aria-hidden="true"
				className="absolute right-8 bottom-7 left-8 flex items-center justify-center gap-3 text-[#a76773]"
			>
				<span className="h-px w-8 bg-[#a76773]/40" />
				<span className="font-serif text-lg leading-none">♥</span>
				<span className="h-px w-8 bg-[#a76773]/40" />
			</div>

			<motion.div
				className="absolute top-14 left-8 rotate-[-15deg] font-bold text-[#b94d64] text-xl opacity-0"
				style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
			>
				{t("swipeSkip")}
			</motion.div>

			<motion.div
				className="absolute top-14 right-8 rotate-[15deg] font-bold text-[#6d3d78] text-xl opacity-0"
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
