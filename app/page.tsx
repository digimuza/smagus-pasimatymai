'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { SwipeCard } from '@/components/SwipeCard';
import { Sidebar } from '@/components/Sidebar';
import { useHaptic } from '@/hooks/useHaptic';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    currentQuestion,
    skipQuestion,
    answerQuestion,
    superlikeQuestion,
    availableQuestionsCount,
  } = useQuestions();
  const { vibrate } = useHaptic();
  const router = useRouter();

  // Check fullscreen state on mount and listen for changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  // Redirect to /awesome when no questions left
  useEffect(() => {
    if (availableQuestionsCount === 0) {
      router.push('/awesome');
    }
  }, [availableQuestionsCount, router]);

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-background-light">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-text-muted hover:text-text transition-colors"
          aria-label="Atidaryti meniu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="text-2xl font-light text-primary">Santykių Klausimai</h1>

        <button
          onClick={toggleFullscreen}
          className="text-text-muted hover:text-text transition-colors"
          aria-label={isFullscreen ? 'Išeiti iš viso ekrano' : 'Visas ekranas'}
        >
          {isFullscreen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Card container */}
        <div className="relative w-full max-w-md h-96 mb-12">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <SwipeCard
                key={currentQuestion.id}
                question={currentQuestion}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Swipe hints */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center text-sm">
          <div className="space-y-1">
            <div className="text-accent text-2xl">←</div>
            <p className="text-text-muted">Praleisti</p>
          </div>
          <div className="space-y-1">
            <div className="text-primary-light text-2xl">↑</div>
            <p className="text-text-muted">Super</p>
          </div>
          <div className="space-y-1">
            <div className="text-primary text-2xl">→</div>
            <p className="text-text-muted">Atsakyta</p>
          </div>
        </div>

        {/* Questions counter */}
        <div className="mt-8 text-text-dimmed text-sm">
          Liko klausimų: {availableQuestionsCount}
        </div>
      </main>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}
