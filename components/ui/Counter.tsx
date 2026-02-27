'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CounterProps {
  current?: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: { number: 'text-2xl', label: 'text-xs' },
  md: { number: 'text-3xl', label: 'text-sm' },
  lg: { number: 'text-4xl', label: 'text-base' },
};

export function Counter({ current, total, label, size = 'md', className = '' }: CounterProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`text-center ${className}`}>
      {label && <p className={`text-text-muted ${styles.label} mb-1`}>{label}</p>}
      <AnimatePresence mode="wait">
        <motion.p
          key={current ?? total}
          className={`${styles.number} font-light text-primary`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {current !== undefined ? `${current} / ${total}` : total}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
