'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { PageLayout, PageContent, Header, Button, Card } from '@/components/ui';

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
      router.push('/game');
    }
  };

  if (superlikedQuestions.length === 0) {
    return (
      <PageLayout>
        <PageContent centered>
          <motion.div {...fadeInUp} className="text-center space-y-6">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-3xl font-light text-primary mb-4">
              Pasibaigė visi klausimai!
            </h1>
            <p className="text-text-muted mb-8">
              Neturite nei vieno super klausimo. Grįžkite ir pažymėkite mėgstamiausius!
            </p>
            <div className="space-y-4 max-w-xs mx-auto">
              <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/game')}>
                Grįžti atgal
              </Button>
              <Button variant="danger" size="lg" fullWidth onClick={handleReset}>
                Iš naujo pradėti
              </Button>
            </div>
          </motion.div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header title="⭐ Super Klausimai" showBack />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative w-full max-w-md mb-8">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <Card
                key={currentQuestion.id}
                variant="elevated"
                padding="lg"
                className="w-full h-96"
                {...scaleIn}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full flex items-center justify-center">
                  <p className="text-2xl md:text-3xl text-text text-center text-balance font-light leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 bg-background-light hover:bg-background-lighter disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
            aria-label="Ankstesnis"
          >
            <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <Button variant="danger" onClick={handleReset} className="mt-8">
          Iš naujo pradėti
        </Button>
      </main>
    </PageLayout>
  );
}
