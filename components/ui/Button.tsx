"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { pressAnimation } from "@/lib/animations";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
	children: React.ReactNode;
	fullWidth?: boolean;
	icon?: React.ReactNode;
	loading?: boolean;
	size?: ButtonSize;
	variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
	danger: "bg-accent/20 hover:bg-accent/30 text-accent font-medium",
	ghost:
		"bg-transparent hover:bg-background-lighter text-text-muted hover:text-text",
	primary: "bg-primary hover:bg-primary-light text-background font-medium",
	secondary: "bg-primary/20 hover:bg-primary/30 text-primary font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
	lg: "py-4 px-8 text-lg rounded-xl",
	md: "py-3 px-6 text-base rounded-xl",
	sm: "py-2 px-4 text-sm rounded-lg",
};

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	icon,
	fullWidth = false,
	children,
	className = "",
	disabled,
	...props
}: ButtonProps) {
	return (
		<motion.button
			{...pressAnimation}
			className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}inline-flex items-center justify-center gap-2 transition-colors ${className}
      `}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						fill="none"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						fill="currentColor"
					/>
				</svg>
			) : icon ? (
				<span className="flex-shrink-0">{icon}</span>
			) : null}
			{children}
		</motion.button>
	);
}
