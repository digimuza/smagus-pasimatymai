'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EMOJIS = ['💜', '💕', '✨', '🌹', '💫', '💗', '😘', '🦋', '💘'];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: EMOJIS[i % EMOJIS.length],
  left: `${5 + (i * 5.3) % 90}%`,
  delay: i * 0.6,
  duration: 6 + (i % 5) * 1.5,
  size: 12 + (i % 5) * 5,
  driftAmplitude: 20 + (i % 4) * 15,
}));

function Particle({ emoji, left, delay, duration, size, driftAmplitude }: {
  emoji: string;
  left: string;
  delay: number;
  duration: number;
  size: number;
  driftAmplitude: number;
}) {
  const travel = typeof window !== 'undefined' ? window.innerHeight + 100 : 900;

  return (
    <motion.div
      className="absolute pointer-events-none select-none will-change-transform"
      style={{ left, fontSize: size, bottom: -40 }}
      animate={{
        y: [0, -travel],
        x: [0, Math.sin(delay) * driftAmplitude, Math.cos(delay) * -driftAmplitude * 0.7, Math.sin(delay) * driftAmplitude * 0.5],
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
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}
