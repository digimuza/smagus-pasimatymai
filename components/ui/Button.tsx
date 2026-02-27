'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { pressAnimation } from '@/lib/animations';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-light text-background font-medium',
  secondary: 'bg-primary/20 hover:bg-primary/30 text-primary font-medium',
  ghost: 'bg-transparent hover:bg-background-lighter text-text-muted hover:text-text',
  danger: 'bg-accent/20 hover:bg-accent/30 text-accent font-medium',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm rounded-lg',
  md: 'py-3 px-6 text-base rounded-xl',
  lg: 'py-4 px-8 text-lg rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      {...pressAnimation}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        inline-flex items-center justify-center gap-2 transition-colors
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
