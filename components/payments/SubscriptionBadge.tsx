'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { isPremium } from '@/lib/subscription';

export function SubscriptionBadge() {
  const t = useTranslations('payments');
  const { subscription } = useAuth();

  if (!subscription) return null;

  if (isPremium(subscription)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold">
        ✨ {t('premiumBadge')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background-lighter text-text-dimmed text-xs border border-primary/10">
      {t('freeBadge')}
    </span>
  );
}
