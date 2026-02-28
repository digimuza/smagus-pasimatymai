"use client";

interface SelectOption {
	icon?: string;
	label: string;
	value: string;
}

interface SelectProps {
	className?: string;
	label?: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	value: string;
}

export function Select({
	options,
	value,
	onChange,
	label,
	className = "",
}: SelectProps) {
	return (
		<div className={`space-y-3 ${className}`}>
			{label && <span className="font-normal text-text">{label}</span>}
			<div className="grid grid-cols-1 gap-2">
				{options.map((option) => {
					const isSelected = value === option.value;
					return (
						<button
							className={`rounded-lg border-2 p-3 text-left transition-all ${
								isSelected
									? "border-primary bg-primary/20"
									: "border-transparent bg-background-lighter hover:border-primary/30"
							}`}
							key={option.value}
							onClick={() => onChange(option.value)}
							type="button"
						>
							<p className="flex items-center gap-2 font-normal text-sm">
								{option.icon && <span>{option.icon}</span>}
								{option.label}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}
