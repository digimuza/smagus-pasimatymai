"use client";

import { motion } from "framer-motion";
import { springs } from "@/lib/animations";

interface ToggleProps {
	className?: string;
	description?: string;
	enabled: boolean;
	label?: string;
	onChange: (enabled: boolean) => void;
}

export function Toggle({
	enabled,
	onChange,
	label,
	description,
	className = "",
}: ToggleProps) {
	return (
		<div className={`flex items-center justify-between ${className}`}>
			{(label || description) && (
				<div>
					{label && <p className="font-normal text-text">{label}</p>}
					{description && (
						<p className="text-sm text-text-muted">{description}</p>
					)}
				</div>
			)}
			<button
				aria-checked={enabled}
				className={`relative h-8 w-14 flex-shrink-0 rounded-full transition-colors ${
					enabled ? "bg-primary" : "bg-background-lighter"
				}`}
				onClick={() => onChange(!enabled)}
				role="switch"
				type="button"
			>
				<motion.div
					animate={{ x: enabled ? 24 : 0 }}
					className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md"
					transition={springs.snappy}
				/>
			</button>
		</div>
	);
}
