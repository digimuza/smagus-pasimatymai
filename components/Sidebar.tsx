'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/context/QuestionContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const {
    sections,
    activeCategories,
    resetProgress,
    availableQuestionsCount,
    spicyCardsEnabled,
  } = useQuestions();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-80 max-w-full bg-background-light z-50 shadow-2xl overflow-y-auto pointer-events-auto"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-primary">Kategorijos</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text transition-colors"
              aria-label="Uždaryti"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Available questions count */}
          <div className="mb-6 p-4 bg-background-lighter rounded-lg">
            <p className="text-text-muted text-sm">Liko klausimų</p>
            <p className="text-primary text-3xl font-bold">{availableQuestionsCount}</p>
          </div>

          {/* Active categories summary */}
          <div className="mb-6 p-4 bg-background-lighter rounded-lg">
            <p className="text-text-muted text-sm mb-2">Aktyvios kategorijos</p>
            <p className="text-primary text-2xl font-light">
              {activeCategories.length} / {sections.length}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-3 mb-8">
            {/* View all categories button */}
            <button
              onClick={() => {
                router.push('/categories');
                onClose();
              }}
              className="w-full py-3 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Kategorijos
            </button>

            {/* Spicy Cards Settings button */}
            <button
              onClick={() => {
                router.push('/settings');
                onClose();
              }}
              className="w-full py-3 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors font-medium flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎲</span>
                <span>Pikantiškos kortelės</span>
              </div>
              {spicyCardsEnabled && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Reset button */}
            <button
              onClick={() => {
                if (confirm('Ar tikrai norite iš naujo pradėti? Prarasite visą progresą.')) {
                  resetProgress();
                  onClose();
                }
              }}
              className="w-full py-3 px-4 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors font-medium"
            >
              Iš naujo pradėti
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
