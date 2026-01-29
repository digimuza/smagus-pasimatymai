'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';

export default function CategoriesPage() {
  const router = useRouter();
  const { sections, toggleCategory, isCategoryActive, activeCategories } = useQuestions();

  // Split sections into safe and intimate categories
  const intimateCategories = [
    'Intymūs klausimai',
    'Gilūs intymūs klausimai',
    'Atviri klausimai apie seksą',
  ];

  const safeCategories = sections.filter(
    (section) => !intimateCategories.includes(section.name)
  );

  const intimateSections = sections.filter((section) =>
    intimateCategories.includes(section.name)
  );

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

        <h1 className="text-2xl font-light text-primary">Kategorijos</h1>

        <div className="w-8" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-light rounded-xl p-6 text-center"
          >
            <p className="text-text-muted mb-2">Pasirinkta kategorijų</p>
            <p className="text-4xl font-light text-primary">
              {activeCategories.length} / {sections.length}
            </p>
          </motion.div>

          {/* Safe Categories */}
          <div>
            <h2 className="text-lg font-light text-primary mb-4">
              Pagrindinės kategorijos
            </h2>
            <div className="space-y-3">
              {safeCategories.map((section, index) => {
                const isActive = isCategoryActive(section.name);
                const isDisabled = activeCategories.length === 1 && isActive;

                return (
                  <motion.button
                    key={section.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (!isDisabled) {
                        toggleCategory(section.name);
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-background-light border-2 border-transparent hover:border-primary/30'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-primary border-primary'
                            : 'bg-transparent border-primary'
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="w-4 h-4 text-background"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Category info */}
                      <div className="text-left">
                        <p className="text-text font-normal">{section.name}</p>
                        <p className="text-sm text-text-muted">{section.range}</p>
                      </div>
                    </div>

                    {/* Question count */}
                    <div className="text-right">
                      <p className="text-2xl font-light text-primary">
                        {section.questions.length}
                      </p>
                      <p className="text-xs text-text-muted">klausimų</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Intimate Categories */}
          <div>
            <h2 className="text-lg font-light text-accent mb-2">
              Intymios kategorijos
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Šios kategorijos išjungtos pagal nutylėjimą
            </p>
            <div className="space-y-3">
              {intimateSections.map((section, index) => {
                const isActive = isCategoryActive(section.name);
                const isDisabled = activeCategories.length === 1 && isActive;

                return (
                  <motion.button
                    key={section.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (safeCategories.length + index) * 0.05 }}
                    onClick={() => {
                      if (!isDisabled) {
                        toggleCategory(section.name);
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent/20 border-2 border-accent'
                        : 'bg-background-light border-2 border-transparent hover:border-accent/30'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-accent border-accent'
                            : 'bg-transparent border-accent'
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="w-4 h-4 text-background"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Category info */}
                      <div className="text-left">
                        <p className="text-text font-normal">{section.name}</p>
                        <p className="text-sm text-text-muted">{section.range}</p>
                      </div>
                    </div>

                    {/* Question count */}
                    <div className="text-right">
                      <p className="text-2xl font-light text-accent">
                        {section.questions.length}
                      </p>
                      <p className="text-xs text-text-muted">klausimų</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Warning */}
          {activeCategories.length === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-text-muted">
                Bent viena kategorija turi būti pasirinkta
              </p>
            </motion.div>
          )}

          {/* Back button */}
          <div className="pt-4 pb-8">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-light text-background rounded-xl transition-colors font-medium"
            >
              Pradėti žaidimą
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
