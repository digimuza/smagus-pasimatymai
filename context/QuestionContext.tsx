'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Question,
  QuestionState,
  Section,
  QuestionContextType,
  QuestionData,
} from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEY, SAFE_CATEGORIES } from '@/lib/constants';
import {
  getNextQuestion,
  getSuperlikedQuestions,
  getAvailableQuestionsCount,
} from '@/lib/questionEngine';
import { SPICY_CARDS, DEFAULT_SPICY_SETTINGS } from '@/lib/spicyCardsData';
import { SpicyCard } from '@/types/spicyCards';

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export function QuestionProvider({ children }: { children: React.ReactNode }) {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState, isStateLoaded] = useLocalStorage(STORAGE_KEY, {
    questionStates: [] as QuestionState[],
    activeCategories: SAFE_CATEGORIES,
    currentQuestionId: null as number | null,
    spicyCardsEnabled: DEFAULT_SPICY_SETTINGS.enabled,
    spicyCardsFrequency: DEFAULT_SPICY_SETTINGS.frequency,
    spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes,
    questionsAnsweredSinceLastSpicy: 0,
  });

  const [currentSpicyCard, setCurrentSpicyCard] = useState<SpicyCard | null>(null);

  // Load question data from JSON
  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data: QuestionData) => {
        setQuestionData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load questions:', error);
        setIsLoading(false);
      });
  }, []);

  // Get all questions (flattened from all sections)
  const allQuestions = useMemo(() => {
    if (!questionData) return [];
    return questionData.sections.flatMap((section) => section.questions);
  }, [questionData]);

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!state.currentQuestionId) return null;
    return allQuestions.find((q) => q.id === state.currentQuestionId) || null;
  }, [allQuestions, state.currentQuestionId]);

  // Get superliked questions
  const superlikedQuestions = useMemo(() => {
    return getSuperlikedQuestions(allQuestions, state.questionStates);
  }, [allQuestions, state.questionStates]);

  // Get available questions count
  const availableQuestionsCount = useMemo(() => {
    if (!questionData) return 0;
    return getAvailableQuestionsCount(
      questionData.sections,
      state.activeCategories,
      state.questionStates
    );
  }, [questionData, state.activeCategories, state.questionStates]);

  // Get random spicy card
  const getRandomSpicyCard = useCallback((): SpicyCard | null => {
    const enabledCards = SPICY_CARDS.filter((card) =>
      state.spicyCardTypes?.includes(card.type)
    );

    if (enabledCards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * enabledCards.length);
    return enabledCards[randomIndex];
  }, [state.spicyCardTypes]);

  // Check if should show spicy card
  const shouldShowSpicyCard = useCallback(() => {
    if (!state.spicyCardsEnabled) return false;
    if (!state.spicyCardsFrequency) return false;

    const count = state.questionsAnsweredSinceLastSpicy || 0;
    return count >= state.spicyCardsFrequency;
  }, [state.spicyCardsEnabled, state.spicyCardsFrequency, state.questionsAnsweredSinceLastSpicy]);

  // Load next question when needed
  const loadNextQuestion = useCallback(() => {
    if (!questionData) return;

    // Check if we should show a spicy card instead
    if (shouldShowSpicyCard()) {
      const spicyCard = getRandomSpicyCard();
      if (spicyCard) {
        setCurrentSpicyCard(spicyCard);
        setState((prev) => ({
          ...prev,
          questionsAnsweredSinceLastSpicy: 0,
          currentQuestionId: null,
        }));
        return;
      }
    }

    const nextQuestion = getNextQuestion(
      questionData.sections,
      state.activeCategories,
      state.questionStates
    );

    setCurrentSpicyCard(null);
    setState((prev) => ({
      ...prev,
      currentQuestionId: nextQuestion?.id || null,
    }));
  }, [questionData, state.activeCategories, state.questionStates, setState, shouldShowSpicyCard, getRandomSpicyCard]);

  // Load initial question
  useEffect(() => {
    if (isStateLoaded && !isLoading && !currentQuestion && availableQuestionsCount > 0) {
      loadNextQuestion();
    }
  }, [isStateLoaded, isLoading, currentQuestion, availableQuestionsCount, loadNextQuestion]);

  // Update question state
  const updateQuestionState = useCallback(
    (questionId: number, status: QuestionState['status']) => {
      setState((prev) => {
        const existingIndex = prev.questionStates.findIndex((qs) => qs.id === questionId);
        const newQuestionStates = [...prev.questionStates];

        if (existingIndex >= 0) {
          newQuestionStates[existingIndex] = {
            id: questionId,
            status,
            answeredAt: new Date().toISOString(),
          };
        } else {
          newQuestionStates.push({
            id: questionId,
            status,
            answeredAt: new Date().toISOString(),
          });
        }

        // Increment spicy card counter for answered/superliked questions
        const shouldIncrement = status === 'answered' || status === 'superliked';

        return {
          ...prev,
          questionStates: newQuestionStates,
          questionsAnsweredSinceLastSpicy: shouldIncrement
            ? (prev.questionsAnsweredSinceLastSpicy || 0) + 1
            : prev.questionsAnsweredSinceLastSpicy,
        };
      });

      // Load next question after updating state
      setTimeout(loadNextQuestion, 0);
    },
    [setState, loadNextQuestion]
  );

  // Actions
  const skipQuestion = useCallback(() => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, 'skipped');
  }, [currentQuestion, updateQuestionState]);

  const answerQuestion = useCallback(() => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, 'answered');
  }, [currentQuestion, updateQuestionState]);

  const superlikeQuestion = useCallback(() => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, 'superliked');
  }, [currentQuestion, updateQuestionState]);

  const toggleCategory = useCallback(
    (categoryName: string) => {
      console.log('toggleCategory called with:', categoryName);
      setState((prev) => {
        const isActive = prev.activeCategories.includes(categoryName);
        console.log('Current active categories:', prev.activeCategories);
        console.log('Is category active?', isActive);

        // Prevent deselecting the last category
        if (isActive && prev.activeCategories.length === 1) {
          console.log('Cannot deselect last category');
          return prev;
        }

        const newCategories = isActive
          ? prev.activeCategories.filter((cat) => cat !== categoryName)
          : [...prev.activeCategories, categoryName];

        console.log('New categories:', newCategories);

        return {
          ...prev,
          activeCategories: newCategories,
        };
      });

      // Reload question after category change
      setTimeout(loadNextQuestion, 0);
    },
    [setState, loadNextQuestion]
  );

  const isCategoryActive = useCallback(
    (categoryName: string) => {
      return state.activeCategories.includes(categoryName);
    },
    [state.activeCategories]
  );

  const dismissSpicyCard = useCallback(() => {
    setCurrentSpicyCard(null);
    setTimeout(loadNextQuestion, 0);
  }, [loadNextQuestion]);

  const toggleSpicyCards = useCallback(
    (enabled: boolean) => {
      setState((prev) => ({
        ...prev,
        spicyCardsEnabled: enabled,
      }));
    },
    [setState]
  );

  const updateSpicyCardsFrequency = useCallback(
    (frequency: number) => {
      setState((prev) => ({
        ...prev,
        spicyCardsFrequency: frequency,
      }));
    },
    [setState]
  );

  const toggleSpicyCardType = useCallback(
    (type: string) => {
      setState((prev) => {
        const types = prev.spicyCardTypes || [];
        const hasType = types.includes(type);

        // Don't allow removing the last type
        if (hasType && types.length === 1) {
          return prev;
        }

        return {
          ...prev,
          spicyCardTypes: hasType ? types.filter((t) => t !== type) : [...types, type],
        };
      });
    },
    [setState]
  );

  const resetProgress = useCallback(() => {
    setState({
      questionStates: [],
      activeCategories: SAFE_CATEGORIES,
      currentQuestionId: null,
      spicyCardsEnabled: DEFAULT_SPICY_SETTINGS.enabled,
      spicyCardsFrequency: DEFAULT_SPICY_SETTINGS.frequency,
      spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes,
      questionsAnsweredSinceLastSpicy: 0,
    });
    setCurrentSpicyCard(null);
    setTimeout(loadNextQuestion, 0);
  }, [setState, loadNextQuestion]);

  const value: QuestionContextType = {
    questions: allQuestions,
    sections: questionData?.sections || [],
    questionStates: state.questionStates,
    activeCategories: state.activeCategories,
    currentQuestion,
    currentSpicyCard,
    availableQuestionsCount,
    superlikedQuestions,
    skipQuestion,
    answerQuestion,
    superlikeQuestion,
    dismissSpicyCard,
    toggleCategory,
    resetProgress,
    isCategoryActive,
    spicyCardsEnabled: state.spicyCardsEnabled || false,
    spicyCardsFrequency: state.spicyCardsFrequency || DEFAULT_SPICY_SETTINGS.frequency,
    enabledSpicyCardTypes: state.spicyCardTypes || DEFAULT_SPICY_SETTINGS.enabledTypes,
    toggleSpicyCards,
    updateSpicyCardsFrequency,
    toggleSpicyCardType,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">Kraunama...</div>
      </div>
    );
  }

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>;
}

export function useQuestions() {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
}
