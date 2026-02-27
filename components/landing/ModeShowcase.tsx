'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ModeCard } from './ModeCard';

export function ModeShowcase() {
  const t = useTranslations('landing.modes');

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-text text-center mb-12"
        >
          {t('title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModeCard
            icon="💜"
            name={t('couples.name')}
            description={t('couples.description')}
            cta={t('couples.cta')}
            colorClass="couples"
            href="/audience"
            delay={0}
          />
          <ModeCard
            icon="🏠"
            name={t('family.name')}
            description={t('family.description')}
            cta={t('family.cta')}
            colorClass="family"
            href="/audience"
            delay={0.15}
          />
          <ModeCard
            icon="🎉"
            name={t('friends.name')}
            description={t('friends.description')}
            cta={t('friends.cta')}
            colorClass="friends"
            href="/audience"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
