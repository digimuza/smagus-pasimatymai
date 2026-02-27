'use client';

import { useRouter } from 'next/navigation';
import { useQuestions } from '@/context/QuestionContext';
import { AUDIENCE_DEFAULTS } from '@/types/audience';
import { Sheet, Button, Counter } from '@/components/ui';

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
    audience,
  } = useQuestions();

  const currentAudience = AUDIENCE_DEFAULTS.find((a) => a.slug === audience);

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="left">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-primary">Kategorijos</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
            aria-label="Uždaryti"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Counter total={availableQuestionsCount} label="Liko klausimų" className="mb-6 p-4 bg-background-lighter rounded-lg" />

        <div className="mb-6 p-4 bg-background-lighter rounded-lg">
          <p className="text-text-muted text-sm mb-2">Aktyvios kategorijos</p>
          <p className="text-primary text-2xl font-light">
            {activeCategories.length} / {sections.length}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <Button
            variant="secondary"
            fullWidth
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
            onClick={() => { router.push('/categories'); onClose(); }}
          >
            Kategorijos
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={<span className="text-lg">🎲</span>}
            onClick={() => { router.push('/settings'); onClose(); }}
          >
            <span className="flex-1 text-left">Pikantiškos kortelės</span>
            {spicyCardsEnabled && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={<span className="text-lg">{currentAudience?.icon || '🎮'}</span>}
            onClick={() => { router.push('/audience'); onClose(); }}
          >
            Pakeisti režimą
          </Button>

          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              if (confirm('Ar tikrai norite iš naujo pradėti? Prarasite visą progresą.')) {
                resetProgress();
                onClose();
              }
            }}
          >
            Iš naujo pradėti
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
