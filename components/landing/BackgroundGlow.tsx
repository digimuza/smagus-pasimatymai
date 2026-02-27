'use client';

import { motion } from 'framer-motion';

const drift = (xRange: number, yRange: number, duration: number) => ({
  x: [0, xRange, -xRange * 0.6, xRange * 0.3, 0],
  y: [0, -yRange, yRange * 0.5, -yRange * 0.8, 0],
  transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
});

export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        animate={{
          ...drift(30, 20, 18),
          scale: [1, 1.1, 1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]"
      />
      <motion.div
        animate={drift(25, 15, 20)}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]"
      />
      <motion.div
        animate={drift(-20, 25, 16)}
        className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary-dark/8 rounded-full blur-[80px]"
      />
      <motion.div
        animate={drift(15, -20, 15)}
        className="absolute top-[15%] left-1/3 w-[350px] h-[350px] bg-accent/8 rounded-full blur-[100px]"
      />
    </div>
  );
}
