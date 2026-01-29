'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SpicyCard } from '@/types/spicyCards';
import { SWIPE_THRESHOLD } from '@/lib/constants';

interface SpicyCardDisplayProps {
  card: SpicyCard;
  onDismiss: () => void;
}

export function SpicyCardDisplay({ card, onDismiss }: SpicyCardDisplayProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Check for up/down swipe
    if (Math.abs(offset.y) > SWIPE_THRESHOLD || Math.abs(velocity.y) > 500) {
      setExitY(offset.y < 0 ? -500 : 500);
      return;
    }

    // Check for left/right swipe
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      setExitX(offset.x < 0 ? -500 : 500);
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-md h-96 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotateZ,
        opacity,
        background: `linear-gradient(135deg, ${card.color}dd, ${card.color}aa)`,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
      animate={
        exitX !== 0 || exitY !== 0
          ? { x: exitX, y: exitY, opacity: 0, transition: { duration: 0.3 } }
          : { scale: 1, opacity: 1, rotateY: 0 }
      }
      onAnimationComplete={() => {
        if (exitX !== 0 || exitY !== 0) {
          onDismiss();
        }
      }}
      transition={{ duration: 0.5, type: 'spring' }}
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

        {/* Swipe instruction */}
        <motion.p
          className="text-sm text-white/70 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Braukite bet kuria kryptimi
        </motion.p>
      </div>

      {/* Swipe indicator */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold text-xl opacity-0 pointer-events-none"
        style={{
          opacity: useTransform(
            x,
            [-150, -50, 0, 50, 150],
            [1, 0, 0, 0, 1]
          )
        }}
      >
        ATLIKTA ✓
      </motion.div>
    </motion.div>
  );
}
