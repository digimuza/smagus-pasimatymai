import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy";

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useHaptic() {
	const vibrate = useCallback((pattern: HapticPattern = "medium") => {
		if (
			typeof window === "undefined" ||
			!("vibrate" in navigator) ||
			prefersReducedMotion()
		) {
			return;
		}

		const patterns = {
			heavy: 40,
			light: 10,
			medium: 20,
		};

		try {
			navigator.vibrate(patterns[pattern]);
		} catch (error) {
			console.error("Haptic feedback failed:", error);
		}
	}, []);

	const vibratePattern = useCallback((pattern: number[]) => {
		if (
			typeof window === "undefined" ||
			!("vibrate" in navigator) ||
			prefersReducedMotion()
		) {
			return;
		}

		try {
			navigator.vibrate(pattern);
		} catch (error) {
			console.error("Haptic feedback failed:", error);
		}
	}, []);

	return { vibrate, vibratePattern };
}
