'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const STEP_ICONS = ['🎯', '👆', '💬'];

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    { icon: STEP_ICONS[0], title: t('step1.title'), description: t('step1.description') },
    { icon: STEP_ICONS[1], title: t('step2.title'), description: t('step2.description') },
    { icon: STEP_ICONS[2], title: t('step3.title'), description: t('step3.description') },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background-light/30 content-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                type: 'spring',
                bounce: 0.4,
              }}
              className="flex flex-col items-center text-center gap-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                className="w-16 h-16 rounded-2xl bg-background-lighter border border-primary/10 flex items-center justify-center text-3xl"
              >
                {step.icon}
              </motion.div>
              <div className="text-sm font-medium text-primary">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-lg font-semibold text-text">{step.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
