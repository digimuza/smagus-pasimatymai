export interface Question {
  id: number;
  question: string;
}

export interface Section {
  name: string;
  range: string;
  questions: Question[];
}

export interface QuestionData {
  title: string;
  total_questions: number;
  sections: Section[];
}

export type QuestionStatus = 'new' | 'skipped' | 'answered' | 'superliked';

export interface QuestionState {
  id: number;
  status: QuestionStatus;
  answeredAt?: string;
}

export interface AppState {
  questionStates: QuestionState[];
  activeCategories: string[];
  currentQuestionId: number | null;
  lastPlayed?: string;
}

export interface QuestionContextType {
  questions: Question[];
  sections: Section[];
  questionStates: QuestionState[];
  activeCategories: string[];
  currentQuestion: Question | null;
  availableQuestionsCount: number;
  superlikedQuestions: Question[];
  skipQuestion: () => void;
  answerQuestion: () => void;
  superlikeQuestion: () => void;
  toggleCategory: (categoryName: string) => void;
  resetProgress: () => void;
  isCategoryActive: (categoryName: string) => boolean;
}
