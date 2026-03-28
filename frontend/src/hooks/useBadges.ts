import { useMemo } from 'react';
import { useMealHistory } from '../context/MealHistoryContext';
import {
  Badge,
  getHighestBadge,
  getUnlockedBadges,
  getNextBadge,
  getProgressToNext,
  BADGES,
} from '../utils/badges';

export interface UseBadgesResult {
  /** Total unique meals cooked */
  cookedCount: number;
  /** Highest badge earned, or null */
  highestBadge: Badge | null;
  /** All earned badges in order */
  unlockedBadges: Badge[];
  /** Next badge to earn, or null if all unlocked */
  nextBadge: Badge | null;
  /** 0–1 progress toward next badge */
  progressToNext: number;
  /** All badge definitions (for full list display) */
  allBadges: Badge[];
}

export function useBadges(): UseBadgesResult {
  const { cookedMeals } = useMealHistory();
  const cookedCount = cookedMeals.length;

  return useMemo(
    () => ({
      cookedCount,
      highestBadge: getHighestBadge(cookedCount),
      unlockedBadges: getUnlockedBadges(cookedCount),
      nextBadge: getNextBadge(cookedCount),
      progressToNext: getProgressToNext(cookedCount),
      allBadges: BADGES,
    }),
    [cookedCount],
  );
}
