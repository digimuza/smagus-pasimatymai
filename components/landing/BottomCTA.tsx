'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

export function BottomCTA() {
  const t = useTranslations('landing.bottomCta');

  return (
    <section className="py-16 sm:py-24">
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

          <Link href="/audience" className="w-full max-w-sm">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-accent text-white font-semibold text-lg text-center shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
            >
              {t('cta')}
            </motion.div>
          </Link>

          <p className="text-text-dimmed text-sm font-light">{t('noCta')}</p>
        </motion.div>
      </div>
    </section>
  );
}
