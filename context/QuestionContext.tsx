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
import { SpicyCard, RARITY_PROBABILITIES } from '@/types/spicyCards';

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export function QuestionProvider({ children }: { children: React.ReactNode }) {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState, isStateLoaded] = useLocalStorage(STORAGE_KEY, {
    questionStates: [] as QuestionState[],
    activeCategories: SAFE_CATEGORIES,
    currentQuestionId: null as number | null,
    spicyCardsEnabled: DEFAULT_SPICY_SETTINGS.enabled,
    spicyCardsRarity: DEFAULT_SPICY_SETTINGS.rarity,
    spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes,
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

  // Sanitize active categories when data loads
  useEffect(() => {
    if (!questionData || !isStateLoaded) return;

    const validCategoryNames = questionData.sections.map((s) => s.name);
    const sanitized = Array.from(new Set(state.activeCategories)) // Remove duplicates
      .filter((cat) => validCategoryNames.includes(cat)); // Remove invalid categories

    // If all categories were removed or none remain, reset to SAFE_CATEGORIES
    if (sanitized.length === 0) {
      setState((prev) => ({ ...prev, activeCategories: SAFE_CATEGORIES }));
    } else if (sanitized.length !== state.activeCategories.length) {
      // Only update if something changed
      setState((prev) => ({ ...prev, activeCategories: sanitized }));
    }
  }, [questionData, isStateLoaded, state.activeCategories, setState]);

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

  // Check if should show spicy card (probability-based)
  const shouldShowSpicyCard = useCallback(() => {
    if (!state.spicyCardsEnabled) return false;
    if (!state.spicyCardsRarity) return false;

    const probability = RARITY_PROBABILITIES[state.spicyCardsRarity as keyof typeof RARITY_PROBABILITIES] || 0.30;
    const randomValue = Math.random();

    return randomValue < probability;
  }, [state.spicyCardsEnabled, state.spicyCardsRarity]);

  // Load next question when needed
  const loadNextQuestion = useCallback(() => {
    if (!questionData) return;

    // Check if we should show a spicy card instead (probability-based)
    if (shouldShowSpicyCard()) {
      const spicyCard = getRandomSpicyCard();
      if (spicyCard) {
        setCurrentSpicyCard(spicyCard);
        setState((prev) => ({
          ...prev,
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
    if (isStateLoaded && !isLoading && !currentQuestion && !currentSpicyCard && availableQuestionsCount > 0) {
      loadNextQuestion();
    }
  }, [isStateLoaded, isLoading, currentQuestion, currentSpicyCard, availableQuestionsCount, loadNextQuestion]);

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

        return {
          ...prev,
          questionStates: newQuestionStates,
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
      setState((prev) => {
        const isActive = prev.activeCategories.includes(categoryName);

        // Prevent deselecting the last category
        if (isActive && prev.activeCategories.length === 1) {
          return prev;
        }

        const newCategories = isActive
          ? prev.activeCategories.filter((cat) => cat !== categoryName)
          : [...prev.activeCategories, categoryName];

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

  const updateSpicyCardsRarity = useCallback(
    (rarity: string) => {
      setState((prev) => ({
        ...prev,
        spicyCardsRarity: rarity,
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
      spicyCardsRarity: DEFAULT_SPICY_SETTINGS.rarity,
      spicyCardTypes: DEFAULT_SPICY_SETTINGS.enabledTypes,
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
    spicyCardsRarity: state.spicyCardsRarity || DEFAULT_SPICY_SETTINGS.rarity,
    enabledSpicyCardTypes: state.spicyCardTypes || DEFAULT_SPICY_SETTINGS.enabledTypes,
    toggleSpicyCards,
    updateSpicyCardsRarity,
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
