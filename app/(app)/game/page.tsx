'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { SwipeCard } from '@/components/SwipeCard';
import { SpicyCardDisplay } from '@/components/SpicyCardDisplay';
import { Sidebar } from '@/components/Sidebar';
import { useHaptic } from '@/hooks/useHaptic';
import { AUDIENCE_DEFAULTS } from '@/types/audience';
import { PageLayout, Header } from '@/components/ui';

export default function GamePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    currentQuestion,
    currentSpicyCard,
    skipQuestion,
    answerQuestion,
    superlikeQuestion,
    dismissSpicyCard,
    availableQuestionsCount,
    audience,
  } = useQuestions();
  const { vibrate } = useHaptic();
  const router = useRouter();

  useEffect(() => {
    if (!audience) {
      router.push('/audience');
    }
  }, [audience, router]);

  useEffect(() => {
    if (audience && availableQuestionsCount === 0) {
      router.push('/awesome');
    }
  }, [audience, availableQuestionsCount, router]);

  const currentAudience = AUDIENCE_DEFAULTS.find((a) => a.slug === audience);

  const handleSwipeLeft = () => {
    vibrate('light');
    skipQuestion();
  };

  const handleSwipeRight = () => {
    vibrate('medium');
    answerQuestion();
  };

  const handleSwipeUp = () => {
    vibrate('heavy');
    superlikeQuestion();
  };

  return (
    <PageLayout>
      <Header
        title="Santykių Klausimai"
        leftAction={
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-text-muted hover:text-text transition-colors"
            aria-label="Atidaryti meniu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        rightAction={
          <div className="w-8 text-center text-xl">{currentAudience?.icon}</div>
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-full max-w-md h-96 mb-12">
          <AnimatePresence mode="wait">
            {currentSpicyCard ? (
              <SpicyCardDisplay key={currentSpicyCard.id} card={currentSpicyCard} onDismiss={dismissSpicyCard} />
            ) : currentQuestion ? (
              <SwipeCard
                key={currentQuestion.id}
                question={currentQuestion}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
              />
            ) : null}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center text-sm">
          <div className="space-y-1">
            <div className="text-accent text-2xl">&larr;</div>
            <p className="text-text-muted">Praleisti</p>
          </div>
          <div className="space-y-1">
            <div className="text-primary-light text-2xl">&uarr;</div>
            <p className="text-text-muted">Super</p>
          </div>
          <div className="space-y-1">
            <div className="text-primary text-2xl">&rarr;</div>
            <p className="text-text-muted">Atsakyta</p>
          </div>
        </div>

        <div className="mt-8 text-text-dimmed text-sm">
          Liko klausimų: {availableQuestionsCount}
        </div>
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </PageLayout>
  );
}
