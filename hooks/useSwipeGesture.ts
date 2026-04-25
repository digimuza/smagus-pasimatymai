"use client";

import { type PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useState } from "react";
import { SWIPE_THRESHOLD, SWIPE_VELOCITY_THRESHOLD } from "@/lib/constants";

export type SwipeDirection = "left" | "right" | "up" | "down";

export interface SwipeGestureOptions {
	enabledDirections?: SwipeDirection[];
	onSwipeDown?: () => void;
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onSwipeUp?: () => void;
	threshold?: number;
	velocityThreshold?: number;
}

const EXIT_DISTANCE = 500;

function classifySwipe(
	offset: { x: number; y: number },
	velocity: { x: number; y: number },
	threshold: number,
	velocityThreshold: number,
	enabledDirections: SwipeDirection[],
): SwipeDirection | null {
	if (
		enabledDirections.includes("up") &&
		(offset.y < -threshold || velocity.y < -velocityThreshold)
	) {
		return "up";
	}
	if (
		enabledDirections.includes("down") &&
		(offset.y > threshold || velocity.y > velocityThreshold)
	) {
		return "down";
	}
	if (
		enabledDirections.includes("left") &&
		(offset.x < -threshold || velocity.x < -velocityThreshold)
	) {
		return "left";
	}
	if (
		enabledDirections.includes("right") &&
		(offset.x > threshold || velocity.x > velocityThreshold)
	) {
		return "right";
	}
	return null;
}

export function useSwipeGesture({
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
	onSwipeDown,
	threshold = SWIPE_THRESHOLD,
	velocityThreshold = SWIPE_VELOCITY_THRESHOLD,
	enabledDirections = ["left", "right", "up"],
}: SwipeGestureOptions = {}) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const [exitX, setExitX] = useState(0);
	const [exitY, setExitY] = useState(0);

	const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
	const cardOpacity = useTransform(
		x,
		[-200, -100, 0, 100, 200],
		[0.5, 1, 1, 1, 0.5],
	);

	const handleDragEnd = useCallback(
		(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			const direction = classifySwipe(
				info.offset,
				info.velocity,
				threshold,
				velocityThreshold,
				enabledDirections,
			);
			if (!direction) return;
			if (direction === "up") setExitY(-EXIT_DISTANCE);
			else if (direction === "down") setExitY(EXIT_DISTANCE);
			else if (direction === "left") setExitX(-EXIT_DISTANCE);
			else setExitX(EXIT_DISTANCE);
		},
		[threshold, velocityThreshold, enabledDirections],
	);

	const handleAnimationComplete = useCallback(() => {
		if (exitX === 0 && exitY === 0) return;
		if (exitY < 0) onSwipeUp?.();
		else if (exitY > 0) onSwipeDown?.();
		else if (exitX < 0) onSwipeLeft?.();
		else onSwipeRight?.();
	}, [exitX, exitY, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

	const isDismissed = exitX !== 0 || exitY !== 0;

	const triggerSwipe = useCallback((direction: SwipeDirection) => {
		if (!enabledDirections.includes(direction)) return;
		if (direction === "up") setExitY(-EXIT_DISTANCE);
		else if (direction === "down") setExitY(EXIT_DISTANCE);
		else if (direction === "left") setExitX(-EXIT_DISTANCE);
		else setExitX(EXIT_DISTANCE);
	}, [enabledDirections]);

	return {
		cardOpacity,
		dragHandlers: {
			drag: true as const,
			dragConstraints: { bottom: 0, left: 0, right: 0, top: 0 },
			dragElastic: 0.7 as const,
			onAnimationComplete: handleAnimationComplete,
			onDragEnd: handleDragEnd,
		},
		exitAnimate: isDismissed
			? { opacity: 0, transition: { duration: 0.3 }, x: exitX, y: exitY }
			: null,
		isDismissed,
		rotateZ,
		triggerSwipe,
		x,
		y,
	};
}
