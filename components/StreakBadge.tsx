'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function StreakBadge() {
  const { streak, isAuthenticated } = useAuth();

  if (!isAuthenticated || streak.currentStreak < 1) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 text-sm"
      >
        <motion.span
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg"
        >
          🔥
        </motion.span>
        <span className="font-bold text-accent">{streak.currentStreak}</span>
      </motion.div>
    </AnimatePresence>
  );
}
