// Shared Framer Motion animation presets
import type { Variants, Transition } from 'framer-motion';

// --- Spring configs ---
export const springs = {
  snappy: { type: 'spring', stiffness: 500, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 300, damping: 15 } as Transition,
} as const;

// --- Single-element animations ---
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const slideDown = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const slideLeft = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const slideRight = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

export const scaleOut = {
  initial: { scale: 1, opacity: 1 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
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
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
};

export const spicyCardFlip = {
  initial: { scale: 0.8, opacity: 0, rotateY: -90 },
  animate: { scale: 1, opacity: 1, rotateY: 0 },
  transition: { duration: 0.5, type: 'spring' } as Transition,
};

// --- Page transitions ---
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 } as Transition,
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
