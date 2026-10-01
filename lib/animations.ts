// Shared Framer Motion animation presets
import type { Transition, Variants } from "framer-motion";

// --- Spring configs ---
export const springs = {
	snappy: { damping: 30, stiffness: 500, type: "spring" } as Transition,
} as const;

// --- Single-element animations ---
export const fadeInUp = {
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
	initial: { opacity: 0, y: 20 },
};

export const scaleIn = {
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.8 },
	initial: { opacity: 0, scale: 0.8 },
};

// --- Variants for lists ---
export const staggerContainer: Variants = {
	hidden: {},
	show: {
		transition: {
			staggerChildren: 0.05,
		},
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, x: -20 },
	show: { opacity: 1, x: 0 },
};

// --- Card-specific ---
export const cardSwipe = {
	animate: { opacity: 1, scale: 1 },
	initial: { opacity: 0, scale: 0 },
	transition: { damping: 30, stiffness: 300, type: "spring" } as Transition,
};

export const spicyCardFlip = {
	animate: { opacity: 1, rotateY: 0, scale: 1 },
	initial: { opacity: 0, rotateY: -90, scale: 0.8 },
	transition: { duration: 0.5, type: "spring" } as Transition,
};

// --- Utility: create a stagger delay for index-based lists ---
export function staggerDelay(index: number, base = 0.3, step = 0.1) {
	return { delay: base + index * step };
}

// --- Press animation for buttons ---
export const pressAnimation = {
	whileHover: { scale: 1.02 },
	whileTap: { scale: 0.97 },
};
