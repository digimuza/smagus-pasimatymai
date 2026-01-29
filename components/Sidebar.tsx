'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/context/QuestionContext';
import { getCategoryQuestionCount } from '@/lib/questionEngine';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const {
    sections,
    activeCategories,
    toggleCategory,
    resetProgress,
    isCategoryActive,
    availableQuestionsCount,
  } = useQuestions();

  console.log('Sidebar render - active categories:', activeCategories);

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

          {/* View all categories button */}
          <button
            onClick={() => {
              router.push('/categories');
              onClose();
            }}
            className="w-full mb-6 py-3 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Visos kategorijos
          </button>

          {/* Categories */}
          <div className="space-y-2 mb-8">
            {sections.map((section) => {
              const isActive = isCategoryActive(section.name);
              const questionCount = getCategoryQuestionCount(sections, section.name);

              return (
                <button
                  key={section.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Clicking category:', section.name);
                    toggleCategory(section.name);
                  }}
                  type="button"
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer text-left relative z-10 ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-background-lighter text-text-muted'
                  }`}
                >
                  <div className="flex-1 pointer-events-none">
                    <p className={`font-medium ${isActive ? 'text-primary' : 'text-text'}`}>
                      {section.name}
                    </p>
                    <p className="text-text-dimmed text-sm">{questionCount} klausimų</p>
                  </div>
                  {isActive && (
                    <div className="text-primary ml-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Settings button */}
          <button
            onClick={() => {
              router.push('/settings');
              onClose();
            }}
            className="w-full mb-3 py-3 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Nustatymai
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
      </motion.div>
    </>
  );
}
