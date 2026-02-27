'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const CARD_EMOJIS = ['💜', '🔥', '😏', '✨', '🎵'];

export function AnimatedCard() {
  const t = useTranslations('landing');
  const [index, setIndex] = useState(0);

  const questions = t.raw('sampleQuestions') as string[];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % questions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [questions.length]);

  return (
    <div className="relative w-full max-w-sm h-56 mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0, rotateZ: -5 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotateZ: 0,
            boxShadow: [
              '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
              '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
              '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
            ],
          }}
          exit={{ scale: 0.8, opacity: 0, rotateZ: 5, x: 200 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-background-lighter via-background-light to-background-lighter border border-primary/20 p-8 flex flex-col items-center justify-center"
        >
          {/* Shimmer border overlay */}
          <motion.div
            className="absolute inset-0 rounded-3xl border border-primary/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="text-3xl mb-4">
            {CARD_EMOJIS[index % CARD_EMOJIS.length]}
          </div>
          <p className="text-text text-center text-lg leading-relaxed font-light">
            {questions[index]}
          </p>
          <div className="mt-4 flex gap-8 text-sm text-text-dimmed">
            <span className="text-accent">{t('swipeLeft')}</span>
            <span className="text-primary">{t('swipeRight')}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stacked cards behind — floating */}
      <motion.div
        animate={{ y: [2, -2, 2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 -z-10 translate-x-2 rounded-3xl bg-background-lighter border border-primary/10 opacity-40"
      />
      <motion.div
        animate={{ y: [4, 0, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute inset-0 -z-20 translate-x-4 rounded-3xl bg-background-lighter border border-primary/5 opacity-20"
      />
    </div>
  );
}
