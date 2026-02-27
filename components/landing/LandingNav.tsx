'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion } from 'framer-motion';

export function LandingNav() {
  const t = useTranslations('landing.nav');

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💜</span>
          <span className="text-lg font-light text-text-muted tracking-wide hidden sm:inline">
            {t('logo')}
          </span>
        </div>
        <LanguageSwitcher />
      </div>
    </motion.header>
  );
}
