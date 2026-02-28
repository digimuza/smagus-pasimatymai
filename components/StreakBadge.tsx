"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function StreakBadge() {
	const { streak, isAuthenticated } = useAuth();

	if (!isAuthenticated || streak.currentStreak < 1) return null;

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className="flex items-center gap-1 text-sm"
				initial={{ opacity: 0, scale: 0 }}
			>
				<motion.span
					animate={{ rotate: [0, -10, 10, -10, 0] }}
					className="text-lg"
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					🔥
				</motion.span>
				<span className="font-bold text-accent">{streak.currentStreak}</span>
			</motion.div>
		</AnimatePresence>
	);
}
