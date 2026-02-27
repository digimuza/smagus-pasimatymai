'use client';

import { useState, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/context/QuestionContext';
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '@/lib/animations';
import { PageLayout, PageContent, Header, Button, Card } from '@/components/ui';
import { Question } from '@/types';
import { shareQuestion } from '@/lib/share';

export default function AwesomePage() {
  const router = useRouter();
  const t = useTranslations('awesome');
  const tc = useTranslations('common');
  const { superlikedQuestions, resetProgress, sections, updateQuestionState, audience } = useQuestions();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build category lookup from sections
  const questionCategoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const section of sections) {
      for (const q of section.questions) {
        map.set(q.id, section.name);
      }
    }
    return map;
  }, [sections]);

  // Filter by search
  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return superlikedQuestions;
    const term = search.toLowerCase();
    return superlikedQuestions.filter(
      (q) =>
        q.question.toLowerCase().includes(term) ||
        (questionCategoryMap.get(q.id) || '').toLowerCase().includes(term)
    );
  }, [superlikedQuestions, search, questionCategoryMap]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    if (confirm(tc('confirm'))) {
      resetProgress();
      router.push('/game');
    }
  };

  const handleUnfavorite = (question: Question) => {
    updateQuestionState(question.id, 'answered');
    if (currentIndex >= filteredQuestions.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (superlikedQuestions.length === 0) {
    return (
      <PageLayout>
        <PageContent centered>
          <motion.div {...fadeInUp} className="text-center space-y-6">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-3xl font-light text-primary mb-4">
              {t('empty')}
            </h1>
            <p className="text-text-muted mb-8">
              {t('emptyDescription')}
            </p>
            <div className="space-y-4 max-w-xs mx-auto">
              <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/game')}>
                {t('goBack')}
              </Button>
              <Button variant="danger" size="lg" fullWidth onClick={handleReset}>
                {t('reset')}
              </Button>
            </div>
          </motion.div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header title={t('title')} showBack />

      <div className="px-4 pt-2 pb-4 max-w-md mx-auto w-full space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentIndex(0); }}
          className="w-full px-4 py-2.5 rounded-xl bg-background-lighter border border-primary/10 text-text placeholder:text-text-dimmed text-sm focus:outline-none focus:border-primary/30"
        />

        {/* View toggle + count */}
        <div className="flex items-center justify-between">
          <span className="text-text-dimmed text-sm">
            {filteredQuestions.length} {tc('questions')}
          </span>
          <div className="flex gap-1 bg-background-lighter rounded-lg p-0.5">
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                view === 'cards' ? 'bg-primary text-background' : 'text-text-muted'
              }`}
            >
              {t('viewCards')}
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                view === 'list' ? 'bg-primary text-background' : 'text-text-muted'
              }`}
            >
              {t('viewList')}
            </button>
          </div>
        </div>
      </div>

      {view === 'cards' && filteredQuestions.length > 0 ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md mb-6">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <Card
                  key={currentQuestion.id}
                  variant="elevated"
                  padding="lg"
                  className="w-full h-80"
                  {...scaleIn}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-2xl md:text-3xl text-text text-center text-balance font-light leading-relaxed">
                      {currentQuestion.question}
                    </p>
                    <p className="text-text-dimmed text-xs mt-4">
                      {questionCategoryMap.get(currentQuestion.id)}
                    </p>
                  </div>
                </Card>
              )}
            </AnimatePresence>
          </div>

          {/* Card actions */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => currentQuestion && shareQuestion(currentQuestion.question, audience || undefined)}
              className="p-2.5 bg-background-lighter rounded-full text-text-muted hover:text-primary transition-colors"
              aria-label={t('share')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button
              onClick={() => currentQuestion && handleUnfavorite(currentQuestion)}
              className="p-2.5 bg-background-lighter rounded-full text-text-muted hover:text-accent transition-colors"
              aria-label={t('unfavorite')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 bg-background-light hover:bg-background-lighter disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
              aria-label={tc('previous')}
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-text-muted">
              {currentIndex + 1} / {filteredQuestions.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="p-3 bg-background-light hover:bg-background-lighter disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
              aria-label={tc('next')}
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 px-4 pb-8 max-w-md mx-auto w-full">
          <motion.div
            className="space-y-2"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {filteredQuestions.map((q) => (
              <motion.div
                key={q.id}
                variants={staggerItem}
                className="flex items-start gap-3 p-4 bg-background-lighter rounded-xl"
              >
                <p className="flex-1 text-text text-sm leading-relaxed">{q.question}</p>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => shareQuestion(q.question, audience || undefined)}
                    className="p-1.5 text-text-dimmed hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleUnfavorite(q)}
                    className="p-1.5 text-accent/60 hover:text-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>
      )}
    </PageLayout>
  );
}
