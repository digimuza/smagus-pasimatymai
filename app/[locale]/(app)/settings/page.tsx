'use client';

import { motion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useQuestions } from '@/context/QuestionContext';
import { SPICY_CARD_TYPE_LABELS, RARITY_LABELS } from '@/lib/spicyCardsData';
import { fadeInUp } from '@/lib/animations';
import { PageLayout, PageContent, Header, Toggle, Select, Card, Button } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('settings');
  const {
    spicyCardsEnabled,
    spicyCardsRarity,
    enabledSpicyCardTypes,
    toggleSpicyCards,
    updateSpicyCardsRarity,
    toggleSpicyCardType,
  } = useQuestions();

  const rarityOptions = Object.entries(RARITY_LABELS).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  return (
    <PageLayout>
      <Header title={t('title')} showBack />

      <PageContent>
        <Card {...fadeInUp}>
          <div className="space-y-6">
            <Toggle
              enabled={spicyCardsEnabled}
              onChange={toggleSpicyCards}
              label={t('spicyToggleLabel')}
              description={t('spicyToggleDescription')}
            />

            {spicyCardsEnabled && (
              <>
                <Select
                  label={t('rarityLabel')}
                  options={rarityOptions}
                  value={spicyCardsRarity}
                  onChange={updateSpicyCardsRarity}
                />
                <p className="text-xs text-text-muted">
                  {t('rarityNote')}
                </p>

                <div className="space-y-3">
                  <h3 className="text-text font-normal">{t('cardTypes')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SPICY_CARD_TYPE_LABELS).map(([type, label]) => {
                      const isEnabled = enabledSpicyCardTypes.includes(type);
                      const isDisabled = enabledSpicyCardTypes.length === 1 && isEnabled;

                      return (
                        <button
                          key={type}
                          onClick={() => {
                            if (!isDisabled) {
                              toggleSpicyCardType(type);
                            }
                          }}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isEnabled
                              ? 'bg-primary/20 border-primary'
                              : 'bg-background-lighter border-transparent hover:border-primary/30'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <p className="text-sm font-normal">{label}</p>
                        </button>
                      );
                    })}
                  </div>
                  {enabledSpicyCardTypes.length === 1 && (
                    <p className="text-xs text-text-muted">
                      {t('minTypeWarning')}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card variant="outlined" className="border-primary/30 bg-primary/10">
            <p className="text-sm text-text-muted" dangerouslySetInnerHTML={{ __html: t('info') }} />
          </Card>
        </motion.div>

        <div className="pt-4 pb-8">
          <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/game')}>
            {t('backToGame')}
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
}
