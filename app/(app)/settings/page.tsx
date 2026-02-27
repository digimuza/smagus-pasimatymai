'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/context/QuestionContext';
import { SPICY_CARD_TYPE_LABELS, RARITY_LABELS } from '@/lib/spicyCardsData';
import { fadeInUp } from '@/lib/animations';
import { PageLayout, PageContent, Header, Toggle, Select, Card, Button } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
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
      <Header title="Pikantiškos kortelės" showBack />

      <PageContent>
        <Card {...fadeInUp}>
          <div className="space-y-6">
            <Toggle
              enabled={spicyCardsEnabled}
              onChange={toggleSpicyCards}
              label="🎲 Spicy Cards"
              description="Įtraukti užduočių korteles tarp klausimų"
            />

            {spicyCardsEnabled && (
              <>
                <Select
                  label="Kaip dažnai rodys?"
                  options={rarityOptions}
                  value={spicyCardsRarity}
                  onChange={updateSpicyCardsRarity}
                />
                <p className="text-xs text-text-muted">
                  Spicy cards pasirodo atsitiktinai su pasirinkta tikimybe
                </p>

                <div className="space-y-3">
                  <h3 className="text-text font-normal">Kortelių tipai</h3>
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
                      Bent vienas kortelės tipas turi būti pasirinktas
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card variant="outlined" className="border-primary/30 bg-primary/10">
            <p className="text-sm text-text-muted">
              <strong className="text-primary">Spicy Cards</strong> - tai įdomios užduotys ir
              iššūkiai, kurie pasirodys tarp klausimų, kad žaidimas būtų įdomesnis ir dinamiškesnis!
            </p>
          </Card>
        </motion.div>

        <div className="pt-4 pb-8">
          <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/game')}>
            Grįžti į žaidimą
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
}
