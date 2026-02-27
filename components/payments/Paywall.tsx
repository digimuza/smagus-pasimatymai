'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Sheet, Button } from '@/components/ui';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
}

const FEATURES_FREE = ['50questions', 'romanticOnly', 'basicCategories'];
const FEATURES_PREMIUM = ['allQuestions', 'allAudiences', 'spicyCards', 'progressSync', 'noAds'];

export function Paywall({ isOpen, onClose, trigger }: PaywallProps) {
  const t = useTranslations('payments');
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="bottom">
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <span className="text-3xl mb-2 block">✨</span>
          <h2 className="text-2xl font-bold text-text">{t('title')}</h2>
          <p className="text-text-muted text-sm mt-1">{t('subtitle')}</p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-primary/10 bg-background-lighter'
            }`}
          >
            <p className="text-text font-semibold">{t('monthly')}</p>
            <p className="text-primary text-xl font-bold mt-1">{t('monthlyPrice')}</p>
            <p className="text-text-dimmed text-xs">{t('perMonth')}</p>
          </button>

          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
              selectedPlan === 'yearly'
                ? 'border-primary bg-primary/5'
                : 'border-primary/10 bg-background-lighter'
            }`}
          >
            <span className="absolute -top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t('savePercent')}
            </span>
            <p className="text-text font-semibold">{t('yearly')}</p>
            <p className="text-primary text-xl font-bold mt-1">{t('yearlyPrice')}</p>
            <p className="text-text-dimmed text-xs">{t('perYear')}</p>
          </button>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {FEATURES_PREMIUM.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-green-400 text-sm">✓</span>
              <span className="text-text text-sm">{t(`feature.${key}`)}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            variant="primary"
            fullWidth
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? t('processing') : t('startTrial')}
          </Button>
        </motion.div>

        <p className="text-text-dimmed text-xs text-center mt-3">{t('trialNote')}</p>
      </div>
    </Sheet>
  );
}
