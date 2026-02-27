'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  emoji: ['💜', '💕', '✨', '🔮', '💫', '💗'][i % 6],
  left: `${8 + (i * 7.5) % 85}%`,
  delay: i * 0.8,
  duration: 6 + (i % 4) * 2,
  size: 16 + (i % 3) * 8,
}));

function Particle({ emoji, left, delay, duration, size }: {
  emoji: string;
  left: string;
  delay: number;
  duration: number;
  size: number;
}) {
  const travel = typeof window !== 'undefined' ? window.innerHeight + 100 : 900;

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left, fontSize: size, bottom: -40 }}
      animate={{
        y: [0, -travel],
        x: [0, Math.sin(delay) * 40, Math.cos(delay) * -30, Math.sin(delay) * 20],
        opacity: [0, 1, 1, 0.6, 0],
        rotate: [0, 15, -10, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function FloatingParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}
