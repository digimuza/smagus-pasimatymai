'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { SPICY_CARD_TYPE_LABELS } from '@/lib/spicyCardsData';

export default function SettingsPage() {
  const router = useRouter();
  const {
    spicyCardsEnabled,
    spicyCardsFrequency,
    enabledSpicyCardTypes,
    toggleSpicyCards,
    updateSpicyCardsFrequency,
    toggleSpicyCardType,
  } = useQuestions();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-background-light">
        <button
          onClick={() => router.push('/')}
          className="text-text-muted hover:text-text transition-colors"
          aria-label="Grįžti"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 className="text-2xl font-light text-primary">Nustatymai</h1>

        <div className="w-8" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Spicy Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-light rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-light text-primary mb-1">
                  🎲 Spicy Cards
                </h2>
                <p className="text-sm text-text-muted">
                  Įtraukti užduočių korteles tarp klausimų
                </p>
              </div>
              <button
                onClick={() => toggleSpicyCards(!spicyCardsEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  spicyCardsEnabled ? 'bg-primary' : 'bg-background-lighter'
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: spicyCardsEnabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {spicyCardsEnabled && (
              <>
                {/* Frequency */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-text font-normal">Dažnumas</label>
                    <span className="text-primary text-xl font-light">
                      Kas {spicyCardsFrequency} klausimų
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={spicyCardsFrequency}
                    onChange={(e) => updateSpicyCardsFrequency(Number(e.target.value))}
                    className="w-full h-2 bg-background-lighter rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                        ((spicyCardsFrequency - 3) / 12) * 100
                      }%, var(--color-background-lighter) ${
                        ((spicyCardsFrequency - 3) / 12) * 100
                      }%, var(--color-background-lighter) 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Dažnai (3)</span>
                    <span>Retai (15)</span>
                  </div>
                </div>

                {/* Card Types */}
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
          </motion.div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4"
          >
            <p className="text-sm text-text-muted">
              <strong className="text-primary">Spicy Cards</strong> - tai įdomios užduotys ir
              iššūkiai, kurie pasirodys tarp klausimų, kad žaidimas būtų įdomesnis ir dinamiškesnis!
            </p>
          </motion.div>

          {/* Back button */}
          <div className="pt-4 pb-8">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-light text-background rounded-xl transition-colors font-medium"
            >
              Grįžti į žaidimą
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
