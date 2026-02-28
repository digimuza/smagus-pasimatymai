"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

type CardVariant = "default" | "elevated" | "outlined";

interface CardProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	padding?: "none" | "sm" | "md" | "lg";
	variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
	default: "bg-background-light",
	elevated:
		"bg-gradient-to-br from-background-light to-background-lighter shadow-lg",
	outlined: "bg-background-light border-2 border-primary/20",
};

const paddingStyles: Record<string, string> = {
	lg: "p-8",
	md: "p-6",
	none: "",
	sm: "p-4",
};

export function Card({
	variant = "default",
	padding = "md",
	children,
	className = "",
	...props
}: CardProps) {
	return (
		<motion.div
			className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}rounded-xl ${className}
      `}
			{...props}
		>
			{children}
		</motion.div>
	);
}
