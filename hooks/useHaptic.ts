import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy';

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern = 'medium') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    const patterns = {
      light: 10,
      medium: 20,
      heavy: 40,
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  const vibratePattern = useCallback((pattern: number[]) => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  return { vibrate, vibratePattern };
}
