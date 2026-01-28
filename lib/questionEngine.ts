import { Question, QuestionState, Section } from '@/types';

/**
 * Get questions from active categories
 */
export function getQuestionsByCategories(
  sections: Section[],
  activeCategories: string[]
): Question[] {
  return sections
    .filter((section) => activeCategories.includes(section.name))
    .flatMap((section) => section.questions);
}

/**
 * Filter out answered and superliked questions
 */
export function getAvailableQuestions(
  questions: Question[],
  questionStates: QuestionState[]
): Question[] {
  const excludedIds = new Set(
    questionStates
      .filter((state) => state.status === 'answered' || state.status === 'superliked')
      .map((state) => state.id)
  );

  return questions.filter((q) => !excludedIds.has(q.id));
}

/**
 * Get a random question from the available pool
 */
export function getRandomQuestion(questions: Question[]): Question | null {
  if (questions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

/**
 * Get the next question to display
 */
export function getNextQuestion(
  sections: Section[],
  activeCategories: string[],
  questionStates: QuestionState[]
): Question | null {
  const categoryQuestions = getQuestionsByCategories(sections, activeCategories);
  const availableQuestions = getAvailableQuestions(categoryQuestions, questionStates);
  return getRandomQuestion(availableQuestions);
}

/**
 * Get all superliked questions
 */
export function getSuperlikedQuestions(
  allQuestions: Question[],
  questionStates: QuestionState[]
): Question[] {
  const superlikedIds = new Set(
    questionStates
      .filter((state) => state.status === 'superliked')
      .map((state) => state.id)
  );

  return allQuestions.filter((q) => superlikedIds.has(q.id));
}

/**
 * Get count of available questions for active categories
 */
export function getAvailableQuestionsCount(
  sections: Section[],
  activeCategories: string[],
  questionStates: QuestionState[]
): number {
  const categoryQuestions = getQuestionsByCategories(sections, activeCategories);
  const availableQuestions = getAvailableQuestions(categoryQuestions, questionStates);
  return availableQuestions.length;
}

/**
 * Get question count for a specific category
 */
export function getCategoryQuestionCount(
  sections: Section[],
  categoryName: string
): number {
  const section = sections.find((s) => s.name === categoryName);
  return section ? section.questions.length : 0;
}
