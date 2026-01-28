'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';

export default function AwesomePage() {
  const router = useRouter();
  const { superlikedQuestions, resetProgress } = useQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = superlikedQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < superlikedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    if (confirm('Ar tikrai norite iš naujo pradėti? Prarasite visą progresą.')) {
      resetProgress();
      router.push('/');
    }
  };

  if (superlikedQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-3xl font-light text-primary mb-4">
            Pasibaigė visi klausimai!
          </h1>
          <p className="text-text-muted mb-8">
            Neturite nei vieno super klausimo. Grįžkite ir pažymėkite mėgstamiausius!
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full max-w-xs py-4 px-6 bg-primary hover:bg-primary-light text-background rounded-lg transition-colors font-medium"
            >
              Grįžti atgal
            </button>

            <button
              onClick={handleReset}
              className="w-full max-w-xs py-4 px-6 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors font-medium"
            >
              Iš naujo pradėti
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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

        <h1 className="text-2xl font-light text-primary">⭐ Super Klausimai</h1>

        <div className="w-8" /> {/* Spacer for centering */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Card */}
        <div className="relative w-full max-w-md mb-8">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                className="w-full h-96 bg-gradient-to-br from-background-light to-background-lighter rounded-2xl shadow-2xl p-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full flex items-center justify-center">
                  <p className="text-2xl md:text-3xl text-text text-center text-balance font-light leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 bg-background-light hover:bg-background-lighter disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
            aria-label="Ankstesnis"
          >
            <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-text-muted">
            {currentIndex + 1} / {superlikedQuestions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === superlikedQuestions.length - 1}
            className="p-3 bg-background-light hover:bg-background-lighter disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
            aria-label="Kitas"
          >
            <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="mt-8 py-3 px-6 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors font-medium"
        >
          Iš naujo pradėti
        </button>
      </main>
    </div>
  );
}
