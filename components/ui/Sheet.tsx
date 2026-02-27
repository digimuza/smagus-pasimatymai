'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { springs } from '@/lib/animations';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ isOpen, onClose, side = 'left', children, className = '' }: SheetProps) {
  const isLeft = side === 'left';

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        className={`fixed z-50 bg-background-light shadow-2xl overflow-y-auto ${
          isLeft
            ? 'top-0 left-0 h-full w-80 max-w-full'
            : 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl'
        } ${className}`}
        initial={isLeft ? { x: '-100%' } : { y: '100%' }}
        animate={isOpen ? (isLeft ? { x: 0 } : { y: 0 }) : (isLeft ? { x: '-100%' } : { y: '100%' })}
        transition={springs.snappy}
      >
        {children}
      </motion.div>
    </>
  );
}
