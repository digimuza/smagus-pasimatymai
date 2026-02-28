"use client";

interface CheckboxProps {
	checked: boolean;
	className?: string;
	color?: "primary" | "accent";
	description?: string;
	disabled?: boolean;
	label?: string;
	onChange: (checked: boolean) => void;
}

export function Checkbox({
	checked,
	onChange,
	disabled = false,
	color = "primary",
	label,
	description,
	className = "",
}: CheckboxProps) {
	const colorMap = {
		accent: {
			checked: "bg-accent border-accent",
			unchecked: "bg-transparent border-accent",
		},
		primary: {
			checked: "bg-primary border-primary",
			unchecked: "bg-transparent border-primary",
		},
	};

	const styles = colorMap[color];

	return (
		<button
			aria-checked={checked}
			className={`flex items-center gap-3 text-left ${
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
			} ${className}`}
			disabled={disabled}
			onClick={() => !disabled && onChange(!checked)}
			role="checkbox"
			type="button"
		>
			<div
				className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
					checked ? styles.checked : styles.unchecked
				}`}
			>
				{checked && (
					<svg
						className="h-4 w-4 text-background"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M5 13l4 4L19 7"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={3}
						/>
					</svg>
				)}
			</div>
			{(label || description) && (
				<div>
					{label && <p className="font-normal text-text">{label}</p>}
					{description && (
						<p className="text-sm text-text-muted">{description}</p>
					)}
				</div>
			)}
		</button>
	);
}
