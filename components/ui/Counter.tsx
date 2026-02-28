"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CounterProps {
	className?: string;
	current?: number;
	label?: string;
	size?: "sm" | "md" | "lg";
	total: number;
}

const sizeStyles = {
	lg: { label: "text-base", number: "text-4xl" },
	md: { label: "text-sm", number: "text-3xl" },
	sm: { label: "text-xs", number: "text-2xl" },
};

export function Counter({
	current,
	total,
	label,
	size = "md",
	className = "",
}: CounterProps) {
	const styles = sizeStyles[size];

	return (
		<div className={`text-center ${className}`}>
			{label && (
				<p className={`text-text-muted ${styles.label} mb-1`}>{label}</p>
			)}
			<AnimatePresence mode="wait">
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className={`${styles.number} font-light text-primary`}
					exit={{ opacity: 0, y: -10 }}
					initial={{ opacity: 0, y: 10 }}
					key={current ?? total}
					transition={{ duration: 0.2 }}
				>
					{current !== undefined ? `${current} / ${total}` : total}
				</motion.p>
			</AnimatePresence>
		</div>
	);
}
