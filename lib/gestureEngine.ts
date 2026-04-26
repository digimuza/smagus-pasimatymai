import { SWIPE_THRESHOLD, SWIPE_VELOCITY_THRESHOLD } from "@/lib/constants";

export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Classify a pointer gesture into a swipe direction.
 * Returns null when the gesture is too small to be a swipe.
 * Priority order: up > down > left > right.
 */
export function classifySwipe(
	offset: { x: number; y: number },
	velocity: { x: number; y: number },
	threshold: number = SWIPE_THRESHOLD,
	velocityThreshold: number = SWIPE_VELOCITY_THRESHOLD,
	enabledDirections: SwipeDirection[] = ["left", "right", "up"],
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
