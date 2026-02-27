'use client';

interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function Select({ options, value, onChange, label, className = '' }: SelectProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-text font-normal">{label}</label>}
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-background-lighter border-transparent hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-normal flex items-center gap-2">
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
