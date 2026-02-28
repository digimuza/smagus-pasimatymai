"use client";

type BadgeVariant = "default" | "success" | "warning" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
	children: React.ReactNode;
	className?: string;
	size?: BadgeSize;
	variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
	default: "bg-primary/20 text-primary",
	info: "bg-info/20 text-info",
	success: "bg-success/20 text-success",
	warning: "bg-warning/20 text-warning",
};

const sizeStyles: Record<BadgeSize, string> = {
	md: "px-3 py-1 text-sm",
	sm: "px-2 py-0.5 text-xs",
};

export function Badge({
	variant = "default",
	size = "md",
	children,
	className = "",
}: BadgeProps) {
	return (
		<span
			className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}inline-flex items-center gap-1 rounded-full font-medium ${className}
      `}
		>
			{children}
		</span>
	);
}
