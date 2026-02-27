function getDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function diffDays(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00Z');
  const b = new Date(dateB + 'T00:00:00Z');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
}

export function calculateStreak(
  current: { currentStreak?: number; longestStreak?: number; lastPlayedDate?: string },
): StreakData {
  const today = getDateStr(new Date());
  const lastPlayed = current.lastPlayedDate || '';
  const currentStreak = current.currentStreak || 0;
  const longestStreak = current.longestStreak || 0;

  if (lastPlayed === today) {
    return { currentStreak, longestStreak, lastPlayedDate: today };
  }

  let newStreak: number;
  if (lastPlayed && diffDays(lastPlayed, today) === 1) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastPlayedDate: today,
  };
}
