'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const FLOATING_HEARTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  emoji: ['💜', '💕', '✨', '🔮', '💫', '💗'][i % 6],
  left: `${8 + (i * 7.5) % 85}%`,
  delay: i * 0.8,
  duration: 6 + (i % 4) * 2,
  size: 16 + (i % 3) * 8,
}));

const SAMPLE_QUESTIONS = [
  'Koks buvo pirmasis įspūdis, kai mane pamatei?',
  'Jei galėtume nukeliauti bet kur pasaulyje, kur norėtum vykti su manimi?',
  'Kas manyje tave labiausiai prajuokina?',
  'Koks buvo tavo gražiausias sapnas apie mudu?',
  'Jei mūsų meilė būtų daina, kokia ji būtų?',
];

function FloatingHeart({ emoji, left, delay, duration, size }: {
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

function AnimatedCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-sm h-56 mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0, rotateZ: -5 }}
          animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateZ: 5, x: 200 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-background-lighter via-background-light to-background-lighter border border-primary/20 shadow-2xl shadow-primary/10 p-8 flex flex-col items-center justify-center"
        >
          <div className="text-3xl mb-4">
            {['💜', '🔥', '😏', '✨', '🎵'][index]}
          </div>
          <p className="text-text text-center text-lg leading-relaxed font-light">
            {SAMPLE_QUESTIONS[index]}
          </p>
          <div className="mt-4 flex gap-8 text-sm text-text-dimmed">
            <span className="text-accent">← praleisti</span>
            <span className="text-primary">atsakyti →</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stacked cards behind */}
      <div className="absolute inset-0 -z-10 translate-y-2 translate-x-2 rounded-3xl bg-background-lighter border border-primary/10 opacity-40" />
      <div className="absolute inset-0 -z-20 translate-y-4 translate-x-4 rounded-3xl bg-background-lighter border border-primary/5 opacity-20" />
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary-dark/8 rounded-full blur-[80px]" />
      </div>

      {/* Floating hearts */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {FLOATING_HEARTS.map((heart) => (
            <FloatingHeart key={heart.id} {...heart} />
          ))}
        </div>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-center p-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">💜</span>
          <span className="text-xl font-light text-text-muted tracking-wide">Santykių Klausimai</span>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        {/* Tagline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-2">
            Pažink savo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-accent">
              mylimiausią
            </span>
          </h1>
          <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight">
            žmogų iš naujo
          </h2>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-text-muted text-center text-lg max-w-md mb-10 font-light leading-relaxed"
        >
          500+ klausimų, kurie privers juoktis, raudonuoti
          ir pamilti vienam kitą dar kartą. Nes &quot;kaip sekėsi&quot;
          nėra tikras pokalbis. 😏
        </motion.p>

        {/* Animated preview card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="w-full mb-12"
        >
          <AnimatedCard />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col items-center gap-4 w-full max-w-sm"
        >
          <Link href="/audience" className="w-full">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-accent text-white font-semibold text-lg text-center shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
            >
              Pradėti žaidimą 💜
            </motion.div>
          </Link>

          <p className="text-text-dimmed text-sm font-light">
            Nereikia registracijos. Tiesiog žaiskite.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="grid grid-cols-3 gap-6 mt-16 w-full max-w-md"
        >
          {[
            { icon: '🃏', label: '500+', sub: 'klausimų' },
            { icon: '🌶️', label: 'Spicy', sub: 'iššūkiai' },
            { icon: '💕', label: '13', sub: 'kategorijų' },
          ].map((feature) => (
            <motion.div
              key={feature.label}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-background-light/50 border border-primary/10 backdrop-blur-sm"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-text font-semibold text-lg">{feature.label}</span>
              <span className="text-text-dimmed text-xs">{feature.sub}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Funny taglines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="mt-16 text-center space-y-3"
        >
          <p className="text-text-dimmed text-sm italic">
            &quot;Geresnis už Tinder — čia tikrai kalbatės.&quot;
          </p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-primary text-sm">★</span>
            ))}
          </div>
          <p className="text-text-dimmed/50 text-xs">
            — Kiekviena pora, kuri nebijojo atsakyti
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.2 }}
        className="text-center py-8 relative z-10"
      >
        <p className="text-text-dimmed/40 text-xs">
          Sukurta su 💜 poroms, kurios nori daugiau nei &quot;gerai&quot;
        </p>
      </motion.footer>
    </div>
  );
}
