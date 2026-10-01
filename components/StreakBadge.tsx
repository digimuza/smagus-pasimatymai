"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function StreakBadge() {
	const { streak, isAuthenticated } = useAuth();
	const prefersReducedMotion = useReducedMotion();
	const shouldRender = isAuthenticated && streak.currentStreak >= 1;

	return (
		<AnimatePresence>
			{shouldRender && (
				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center gap-1 text-sm"
					exit={{ opacity: 0, scale: 0.6 }}
					initial={{ opacity: 0, scale: 0 }}
				>
					{prefersReducedMotion ? (
						<span className="text-lg">🔥</span>
					) : (
						<motion.span
							animate={{ rotate: [0, -10, 10, -10, 0] }}
							className="text-lg"
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							🔥
						</motion.span>
					)}
					<span className="font-bold text-accent">{streak.currentStreak}</span>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
