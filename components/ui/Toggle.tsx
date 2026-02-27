'use client';

import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Toggle({ enabled, onChange, label, description, className = '' }: ToggleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div>
          {label && <p className="text-text font-normal">{label}</p>}
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </div>
      )}
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-primary' : 'bg-background-lighter'
        }`}
      >
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ x: enabled ? 24 : 0 }}
          transition={springs.snappy}
        />
      </button>
    </div>
  );
}
