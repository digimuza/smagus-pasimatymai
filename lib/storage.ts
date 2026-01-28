import { AppState } from '@/types';
import { STORAGE_KEY, SAFE_CATEGORIES } from './constants';

/**
 * Get default/initial app state
 */
export function getInitialState(): AppState {
  return {
    questionStates: [],
    activeCategories: SAFE_CATEGORIES,
    currentQuestionId: null,
    lastPlayed: new Date().toISOString(),
  };
}

/**
 * Load state from localStorage
 */
export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AppState;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Save state to localStorage
 */
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    const stateToSave = {
      ...state,
      lastPlayed: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Clear state from localStorage
 */
export function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
}
