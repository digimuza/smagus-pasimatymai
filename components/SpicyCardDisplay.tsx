'use client';

import { motion } from 'framer-motion';
import { SpicyCard } from '@/types/spicyCards';

interface SpicyCardDisplayProps {
  card: SpicyCard;
  onDismiss: () => void;
}

export function SpicyCardDisplay({ card, onDismiss }: SpicyCardDisplayProps) {
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div
        className="w-full h-full rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${card.color}dd, ${card.color}aa)`,
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          {/* Icon */}
          <motion.div
            className="text-8xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {card.icon}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl font-light text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {card.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-xl text-white/90 max-w-md text-balance leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {card.description}
          </motion.p>

          {/* Badge */}
          <motion.div
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-white/90 font-medium">🎲 Spicy Card</p>
          </motion.div>
        </div>

        {/* Dismiss button */}
        <motion.button
          onClick={onDismiss}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-colors font-medium flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Atlikta</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
