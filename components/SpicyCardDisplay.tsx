"use client";

import {
	motion,
	type PanInfo,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui";
import { fadeInUp, spicyCardFlip } from "@/lib/animations";
import { SWIPE_THRESHOLD } from "@/lib/constants";
import type { SpicyCard } from "@/types/spicyCards";

interface SpicyCardDisplayProps {
	card: SpicyCard;
	onDismiss: () => void;
}

export function SpicyCardDisplay({ card, onDismiss }: SpicyCardDisplayProps) {
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

		if (Math.abs(offset.y) > SWIPE_THRESHOLD || Math.abs(velocity.y) > 500) {
			setExitY(offset.y < 0 ? -500 : 500);
			return;
		}

		if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
			setExitX(offset.x < 0 ? -500 : 500);
		}
	};

	return (
		<motion.div
			animate={
				exitX !== 0 || exitY !== 0
					? { opacity: 0, transition: { duration: 0.3 }, x: exitX, y: exitY }
					: spicyCardFlip.animate
			}
			className="absolute relative flex h-96 w-full max-w-md cursor-grab flex-col items-center justify-center overflow-hidden rounded-2xl p-8 shadow-lg active:cursor-grabbing"
			drag
			dragConstraints={{ bottom: 0, left: 0, right: 0, top: 0 }}
			dragElastic={0.7}
			initial={spicyCardFlip.initial}
			onAnimationComplete={() => {
				if (exitX !== 0 || exitY !== 0) onDismiss();
			}}
			onDragEnd={handleDragEnd}
			style={{
				background: `linear-gradient(135deg, ${card.color}dd, ${card.color}aa)`,
				opacity,
				rotateZ,
				x,
				y,
			}}
			transition={spicyCardFlip.transition}
		>
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-10">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"radial-gradient(circle, white 1px, transparent 1px)",
						backgroundSize: "20px 20px",
					}}
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center">
				<motion.div
					animate={{ scale: 1 }}
					className="text-8xl"
					initial={{ scale: 0 }}
					transition={{ delay: 0.2, stiffness: 200, type: "spring" }}
				>
					{card.icon}
				</motion.div>

				<motion.h2
					className="font-light text-3xl text-white"
					{...fadeInUp}
					transition={{ delay: 0.3 }}
				>
					{card.title}
				</motion.h2>

				<motion.p
					className="max-w-md text-balance text-white/90 text-xl leading-relaxed"
					{...fadeInUp}
					transition={{ delay: 0.4 }}
				>
					{card.description}
				</motion.p>

				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					initial={{ opacity: 0, scale: 0.8 }}
					transition={{ delay: 0.5 }}
				>
					<Badge className="bg-white/20 text-white/90 backdrop-blur-sm">
						{t("spicyBadge")}
					</Badge>
				</motion.div>

				<motion.p
					animate={{ opacity: 1 }}
					className="mt-4 text-sm text-white/70"
					initial={{ opacity: 0 }}
					transition={{ delay: 0.6 }}
				>
					{t("swipeAny")}
				</motion.p>
			</div>

			<motion.div
				className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 font-bold text-white text-xl opacity-0"
				style={{
					opacity: useTransform(x, [-150, -50, 0, 50, 150], [1, 0, 0, 0, 1]),
				}}
			>
				{t("swipeDone")}
			</motion.div>
		</motion.div>
	);
}
