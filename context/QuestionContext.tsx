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

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export function QuestionProvider({ children }: { children: React.ReactNode }) {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState, isStateLoaded] = useLocalStorage(STORAGE_KEY, {
    questionStates: [] as QuestionState[],
    activeCategories: SAFE_CATEGORIES,
    currentQuestionId: null as number | null,
  });

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

  // Load next question when needed
  const loadNextQuestion = useCallback(() => {
    if (!questionData) return;

    const nextQuestion = getNextQuestion(
      questionData.sections,
      state.activeCategories,
      state.questionStates
    );

    setState((prev) => ({
      ...prev,
      currentQuestionId: nextQuestion?.id || null,
    }));
  }, [questionData, state.activeCategories, state.questionStates, setState]);

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

  const resetProgress = useCallback(() => {
    setState({
      questionStates: [],
      activeCategories: SAFE_CATEGORIES,
      currentQuestionId: null,
    });
    setTimeout(loadNextQuestion, 0);
  }, [setState, loadNextQuestion]);

  const value: QuestionContextType = {
    questions: allQuestions,
    sections: questionData?.sections || [],
    questionStates: state.questionStates,
    activeCategories: state.activeCategories,
    currentQuestion,
    availableQuestionsCount,
    superlikedQuestions,
    skipQuestion,
    answerQuestion,
    superlikeQuestion,
    toggleCategory,
    resetProgress,
    isCategoryActive,
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
