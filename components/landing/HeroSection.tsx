'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { AnimatedCard } from './AnimatedCard';

export function HeroSection() {
  const t = useTranslations('landing');

  return (
    <section className="relative py-12 sm:py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Headline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight mb-2">
            {t('heroTitle1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-accent">
              {t('heroHighlight')}
            </span>
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight">
            {t('heroTitle2')}
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-text-muted text-center text-lg max-w-md mb-10 font-light leading-relaxed"
        >
          {t('heroDescription')}
        </motion.p>

        {/* Animated card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="w-full mb-12"
        >
          <AnimatedCard />
        </motion.div>

        {/* CTA */}
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
              {t('cta')}
            </motion.div>
          </Link>
          <p className="text-text-dimmed text-sm font-light">
            {t('noCta')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
