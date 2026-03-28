// ─────────────────────────────────────────────────────────────────────────────
// Badge / Achievement System for MealMate
// Each tier is unlocked after cooking a certain total number of unique meals.
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeTier = 'starter' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Badge {
  tier: BadgeTier;
  /** Minimum total cooked meals to unlock */
  threshold: number;
  label: string;
  description: string;
  /** Emoji icon used in the UI */
  emoji: string;
  /** Hex accent colour for the badge card */
  color: string;
  /** Lighter background tint */
  bg: string;
}

export const BADGES: Badge[] = [
  {
    tier: 'starter',
    threshold: 1,
    label: 'First Bite',
    description: 'Cook your very first meal',
    emoji: '🍽️',
    color: '#6B9E6B',
    bg: '#EAF5EA',
  },
  {
    tier: 'bronze',
    threshold: 5,
    label: 'Bronze Chef',
    description: 'Cook 5 different meals',
    emoji: '🥉',
    color: '#CD7F32',
    bg: '#FDF3E7',
  },
  {
    tier: 'silver',
    threshold: 15,
    label: 'Silver Cook',
    description: 'Cook 15 different meals',
    emoji: '🥈',
    color: '#8A8A9A',
    bg: '#F2F2F7',
  },
  {
    tier: 'gold',
    threshold: 30,
    label: 'Gold Master',
    description: 'Cook 30 different meals',
    emoji: '🥇',
    color: '#D4A017',
    bg: '#FEF9E7',
  },
  {
    tier: 'diamond',
    threshold: 50,
    label: 'Diamond Legend',
    description: 'Cook 50 different meals',
    emoji: '💎',
    color: '#4FC3F7',
    bg: '#E1F5FE',
  },
];

/** All milestones in order for progress display */
export const MILESTONES = [1, 5, 15, 30, 50] as const;

/**
 * Returns the highest unlocked badge for a given cooked-meals count,
 * or null if none unlocked yet.
 */
export function getHighestBadge(cookedCount: number): Badge | null {
  const unlocked = BADGES.filter((b) => cookedCount >= b.threshold);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
}

/**
 * Returns all unlocked badges.
 */
export function getUnlockedBadges(cookedCount: number): Badge[] {
  return BADGES.filter((b) => cookedCount >= b.threshold);
}

/**
 * Returns the next badge to unlock (or null if all unlocked).
 */
export function getNextBadge(cookedCount: number): Badge | null {
  return BADGES.find((b) => cookedCount < b.threshold) ?? null;
}

/**
 * Progress from 0..1 toward the next badge threshold.
 * Returns 1 if all badges are unlocked.
 */
export function getProgressToNext(cookedCount: number): number {
  const prev = [...BADGES].reverse().find((b) => cookedCount >= b.threshold);
  const next = getNextBadge(cookedCount);
  if (!next) return 1;
  const from = prev?.threshold ?? 0;
  return Math.min((cookedCount - from) / (next.threshold - from), 1);
}
