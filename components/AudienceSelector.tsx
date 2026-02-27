'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useQuestions } from '@/context/QuestionContext';
import { useAuth } from '@/context/AuthContext';
import { AUDIENCE_DEFAULTS } from '@/types/audience';
import { canAccessAudience } from '@/lib/subscription';
import { fadeInUp, pressAnimation, staggerDelay } from '@/lib/animations';
import { PageLayout } from '@/components/ui';
import { Paywall } from '@/components/payments/Paywall';
import { DailyQuestion } from '@/components/DailyQuestion';

export function AudienceSelector() {
  const router = useRouter();
  const t = useTranslations();
  const { setAudience } = useQuestions();
  const { subscription } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSelect = (slug: string) => {
    if (!canAccessAudience(slug, subscription)) {
      setShowPaywall(true);
      return;
    }
    setAudience(slug);
    router.push('/game');
  };

  return (
    <PageLayout className="relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <motion.header
        {...fadeInUp}
        className="flex items-center justify-center p-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">💜</span>
          <span className="text-xl font-light text-text-muted tracking-wide">{t('common.appName')}</span>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">{t('audience.title')}</h1>
          <p className="text-text-muted text-lg font-light">{t('audience.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {AUDIENCE_DEFAULTS.map((audience, index) => {
            const locked = !canAccessAudience(audience.slug, subscription);
            return (
              <motion.button
                key={audience.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={staggerDelay(index)}
                {...pressAnimation}
                onClick={() => handleSelect(audience.slug)}
                className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-background-light border-2 border-transparent hover:border-primary/30 transition-colors"
                style={{ boxShadow: `0 4px 20px ${audience.color}15` }}
              >
                {locked && (
                  <span className="absolute top-2 right-2 bg-accent/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
                <span className="text-5xl">{audience.icon}</span>
                <span className="text-text font-semibold text-lg">{t(`audience.${audience.slug}.name`)}</span>
                <span className="text-text-muted text-sm font-light text-center leading-snug">
                  {t(`audience.${audience.slug}.description`)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Daily question */}
        <motion.div {...fadeInUp} transition={{ delay: 0.8 }} className="w-full max-w-md mt-8">
          <DailyQuestion audience="romantic" />
        </motion.div>
      </main>

      <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} trigger="audience_locked" />
    </PageLayout>
  );
}
