'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';

const FLOATING_HEARTS = [
  { emoji: '💗', left: '10%', top: '20%', delay: 0, duration: 4 },
  { emoji: '💕', left: '85%', top: '30%', delay: 1.2, duration: 3.5 },
  { emoji: '💘', left: '15%', top: '70%', delay: 2.5, duration: 4.5 },
  { emoji: '✨', left: '80%', top: '65%', delay: 0.8, duration: 3.8 },
];

export function BottomCTA() {
  const t = useTranslations('landing.bottomCta');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-16 sm:py-24">
      {/* Floating hearts */}
      {FLOATING_HEARTS.map((heart, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none text-lg opacity-40"
          style={{ left: heart.left, top: heart.top }}
          animate={{
            y: [0, -10, 0, 8, 0],
            x: [0, 5, -5, 3, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {heart.emoji}
        </motion.span>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text">{t('title')}</h2>
          <p className="text-text-muted text-lg max-w-md font-light">{t('subtitle')}</p>

          <Link
            href="/audience"
            className="relative w-full max-w-sm"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-accent text-white font-semibold text-lg text-center shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 animate-heartbeat"
            >
              {t('cta')}
            </motion.div>
            {/* Floating heart on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ scale: 0, opacity: 1, y: 0 }}
                  animate={{ scale: 1, opacity: 0, y: -40 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute -top-2 right-4 text-xl pointer-events-none"
                >
                  💗
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <p className="text-text-dimmed text-sm font-light">{t('noCta')}</p>
        </motion.div>
      </div>
    </section>
  );
}
