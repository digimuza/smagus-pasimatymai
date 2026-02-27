'use client';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: 'primary' | 'accent';
  label?: string;
  description?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  color = 'primary',
  label,
  description,
  className = '',
}: CheckboxProps) {
  const colorMap = {
    primary: {
      checked: 'bg-primary border-primary',
      unchecked: 'bg-transparent border-primary',
    },
    accent: {
      checked: 'bg-accent border-accent',
      unchecked: 'bg-transparent border-accent',
    },
  };

  const styles = colorMap[color];

  return (
    <button
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-3 text-left ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div
        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          checked ? styles.checked : styles.unchecked
        }`}
      >
        {checked && (
          <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-text font-normal">{label}</p>}
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </div>
      )}
    </button>
  );
}
