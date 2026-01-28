'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Question } from '@/types';
import { SWIPE_THRESHOLD } from '@/lib/constants';

interface SwipeCardProps {
  question: Question;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}

export function SwipeCard({ question, onSwipeLeft, onSwipeRight, onSwipeUp }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Check for up swipe (super like)
    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -500) {
      setExitY(-500);
      return;
    }

    // Check for left/right swipe
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      if (offset.x < 0) {
        setExitX(-500);
      } else {
        setExitX(500);
      }
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-md h-96 bg-gradient-to-br from-background-light to-background-lighter rounded-2xl shadow-2xl p-8 cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotateZ,
        opacity,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        exitX !== 0 || exitY !== 0
          ? { x: exitX, y: exitY, opacity: 0, transition: { duration: 0.3 } }
          : { scale: 1, opacity: 1 }
      }
      onAnimationComplete={() => {
        if (exitX !== 0 || exitY !== 0) {
          if (exitY < 0) {
            onSwipeUp();
          } else if (exitX < 0) {
            onSwipeLeft();
          } else if (exitX > 0) {
            onSwipeRight();
          }
        }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      key={question.id}
    >
      <div className="h-full flex items-center justify-center">
        <p className="text-2xl md:text-3xl text-text text-center text-balance font-light leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-8 left-8 text-accent font-bold text-xl rotate-[-15deg] opacity-0"
        style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
      >
        PRALEISTI
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 text-primary font-bold text-xl rotate-[15deg] opacity-0"
        style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
      >
        ATSAKYTA
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-light font-bold text-xl opacity-0"
        style={{ opacity: useTransform(y, [-150, -50], [1, 0]) }}
      >
        ⭐ SUPER
      </motion.div>
    </motion.div>
  );
}
