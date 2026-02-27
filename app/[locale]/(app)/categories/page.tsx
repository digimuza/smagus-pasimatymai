'use client';

import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { PageLayout, PageContent, Header, Counter, Checkbox, Button } from '@/components/ui';

export default function CategoriesPage() {
  const router = useRouter();
  const t = useTranslations('categories');
  const tc = useTranslations('common');
  const { sections, toggleCategory, isCategoryActive, activeCategories, audience } = useQuestions();

  const safeCategories = sections.filter((s) => s.type === 'safe');
  const intimateSections = sections.filter((s) => s.type === 'intimate');

  return (
    <PageLayout>
      <Header title={t('title')} showBack />

      <PageContent>
        <Counter
          current={activeCategories.length}
          total={sections.length}
          label={t('selectedCount')}
        />

        {/* Safe Categories */}
        <div>
          <h2 className="text-lg font-light text-primary mb-4">{t('main')}</h2>
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {safeCategories.map((section) => {
              const isActive = isCategoryActive(section.name);
              const isDisabled = activeCategories.length === 1 && isActive;

              return (
                <motion.div key={section.name} variants={staggerItem}>
                  <button
                    onClick={() => !isDisabled && toggleCategory(section.name)}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-background-light border-2 border-transparent hover:border-primary/30'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={isActive}
                      onChange={() => {}}
                      disabled={isDisabled}
                      label={section.name}
                      description={section.range}
                    />
                    <div className="text-right">
                      <p className="text-2xl font-light text-primary">{section.questions.length}</p>
                      <p className="text-xs text-text-muted">{tc('questions')}</p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Intimate Categories — hidden for kids */}
        {audience !== 'kids' && intimateSections.length > 0 && (
          <div>
            <h2 className="text-lg font-light text-accent mb-2">{t('intimate')}</h2>
            <p className="text-sm text-text-muted mb-4">{t('intimateNote')}</p>
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {intimateSections.map((section) => {
                const isActive = isCategoryActive(section.name);
                const isDisabled = activeCategories.length === 1 && isActive;

                return (
                  <motion.div key={section.name} variants={staggerItem}>
                    <button
                      onClick={() => !isDisabled && toggleCategory(section.name)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                        isActive
                          ? 'bg-accent/20 border-2 border-accent'
                          : 'bg-background-light border-2 border-transparent hover:border-accent/30'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Checkbox
                        checked={isActive}
                        onChange={() => {}}
                        disabled={isDisabled}
                        color="accent"
                        label={section.name}
                        description={section.range}
                      />
                      <div className="text-right">
                        <p className="text-2xl font-light text-accent">{section.questions.length}</p>
                        <p className="text-xs text-text-muted">{tc('questions')}</p>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {activeCategories.length === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-center"
          >
            <p className="text-sm text-text-muted">{t('minWarning')}</p>
          </motion.div>
        )}

        <div className="pt-4 pb-8">
          <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/game')}>
            {t('startGame')}
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
}
