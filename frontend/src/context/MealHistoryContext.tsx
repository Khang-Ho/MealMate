import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface CookedMeal {
  rowId?: string;       // UUID from Supabase (undefined for optimistic entries)
  id: number;           // Spoonacular recipe id
  title: string;
  image: string | null;
  cookedAt: Date;
}

export interface MarkAsCookedResult {
  streakIncreased: boolean;
  newStreak: number;
}

export interface FavouriteRecipe {
  id: number;
  title: string;
  image: string | null;
}

export interface RecentRecipe {
  id: number;
  title: string;
  image: string | null;
}

interface MealHistoryContextValue {
  cookedMeals: CookedMeal[];
  currentStreak: number;
  cookedMealsSynced: boolean;
  favourites: FavouriteRecipe[];
  favouritesSynced: boolean;
  recentRecipe: RecentRecipe | null;
  markAsCooked: (meal: Omit<CookedMeal, 'cookedAt' | 'rowId'>) => Promise<MarkAsCookedResult>;
  removeCooked: (rowId: string) => Promise<void>;
  toggleFavourite: (recipe: FavouriteRecipe) => void;
  isFavourite: (id: number) => boolean;
  setRecentRecipe: (recipe: RecentRecipe) => void;
}

const MealHistoryContext = createContext<MealHistoryContextValue | null>(null);

function getLocalDateString(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function calculateStreak(meals: CookedMeal[]): number {
  if (meals.length === 0) return 0;
  const dates = Array.from(new Set(meals.map(m => getLocalDateString(m.cookedAt))));
  dates.sort((a, b) => b.localeCompare(a));
  
  const todayDate = new Date();
  const todayStr = getLocalDateString(todayDate);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let currentCheckDate = dates.includes(todayStr) ? todayDate : yesterdayDate;
  
  while (true) {
    const checkStr = getLocalDateString(currentCheckDate);
    if (dates.includes(checkStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const MealHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [cookedMealsSynced, setCookedMealsSynced] = useState(false);
  const [favourites, setFavourites] = useState<FavouriteRecipe[]>([]);
  const [favouritesSynced, setFavouritesSynced] = useState(false);
  const [recentRecipe, setRecentRecipe] = useState<RecentRecipe | null>(null);

  const currentStreak = calculateStreak(cookedMeals);

  // ── Load cooked meals from API ─────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !userId) {
      setCookedMeals([]);
      setCookedMealsSynced(true);
      return;
    }

    let cancelled = false;
    setCookedMealsSynced(false);

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/cooked-meals?user_id=${encodeURIComponent(userId)}&limit=50`,
        );
        if (!res.ok) {
          console.warn('[MealHistory] cooked-meals GET failed', res.status);
          if (!cancelled) setCookedMealsSynced(true);
          return;
        }
        const data = await res.json();
        const rows = (data.meals ?? []) as {
          id: string;
          spoonacular_id: number;
          title: string;
          image: string | null;
          cooked_at: string;
        }[];
        const mapped: CookedMeal[] = rows.map((r) => ({
          rowId: r.id,
          id: r.spoonacular_id,
          title: r.title,
          image: r.image ?? null,
          cookedAt: new Date(r.cooked_at),
        }));
        if (!cancelled) {
          setCookedMeals(mapped);
          setCookedMealsSynced(true);
        }
      } catch (e) {
        console.warn('[MealHistory] cooked-meals load error', e);
        if (!cancelled) setCookedMealsSynced(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, userId]);

  // ── Load favourites from API ───────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !userId) {
      setFavourites([]);
      setFavouritesSynced(true);
      return;
    }

    let cancelled = false;
    setFavouritesSynced(false);

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/saved-recipes?user_id=${encodeURIComponent(userId)}`,
        );
        if (!res.ok) {
          console.warn('[MealHistory] saved-recipes GET failed', res.status);
          if (!cancelled) setFavouritesSynced(true);
          return;
        }
        const data = await res.json();
        const rows = data.recipes ?? [];
        const mapped: FavouriteRecipe[] = rows.map(
          (r: { spoonacular_id: number; title: string; image: string | null }) => ({
            id: r.spoonacular_id,
            title: r.title,
            image: r.image ?? null,
          }),
        );
        if (!cancelled) {
          setFavourites(mapped);
          setFavouritesSynced(true);
        }
      } catch (e) {
        console.warn('[MealHistory] saved-recipes load error', e);
        if (!cancelled) setFavouritesSynced(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, userId]);

  // ── Mark as cooked (optimistic + persist) ─────────────────────────────────
  const markAsCooked = useCallback(
    async (meal: Omit<CookedMeal, 'cookedAt' | 'rowId'>): Promise<MarkAsCookedResult> => {
      const optimistic: CookedMeal = { ...meal, cookedAt: new Date() };
      const nextMeals = [optimistic, ...cookedMeals.filter((m) => m.id !== meal.id)];
      
      const oldStreak = calculateStreak(cookedMeals);
      const newStreak = calculateStreak(nextMeals);
      const streakIncreased = newStreak > oldStreak;

      setCookedMeals(nextMeals);

      if (!userId) return { streakIncreased, newStreak };

      try {
        const res = await fetch(`${API_URL}/api/cooked-meals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            spoonacular_id: meal.id,
            title: meal.title,
            image: meal.image,
          }),
        });
        if (!res.ok) {
          console.warn('[MealHistory] cooked-meals POST failed', res.status);
          return { streakIncreased, newStreak };
        }
        const row = await res.json();
        // Backfill rowId from DB response so future deletes work
        setCookedMeals((prev) =>
          prev.map((m) =>
            m.id === meal.id && !m.rowId ? { ...m, rowId: row.id } : m,
          ),
        );
      } catch (e) {
        console.warn('[MealHistory] cooked-meals save error', e);
      }

      return { streakIncreased, newStreak };
    },
    [userId, cookedMeals],
  );

  // ── Remove a cooked meal ───────────────────────────────────────────────────
  const removeCooked = useCallback(
    async (rowId: string) => {
      setCookedMeals((prev) => prev.filter((m) => m.rowId !== rowId));
      if (!userId) return;
      try {
        const res = await fetch(
          `${API_URL}/api/cooked-meals/${rowId}?user_id=${encodeURIComponent(userId)}`,
          { method: 'DELETE' },
        );
        if (!res.ok) console.warn('[MealHistory] cooked-meals DELETE failed', res.status);
      } catch (e) {
        console.warn('[MealHistory] cooked-meals delete error', e);
      }
    },
    [userId],
  );

  // ── Toggle favourite (optimistic + persist) ───────────────────────────────
  const toggleFavourite = useCallback(
    async (recipe: FavouriteRecipe) => {
      if (!userId) {
        console.warn('[MealHistory] toggle favourite skipped — not signed in');
        return;
      }

      const previous = favourites;
      const exists = previous.some((f) => f.id === recipe.id);
      const nextLocal = exists
        ? previous.filter((f) => f.id !== recipe.id)
        : [recipe, ...previous];
      setFavourites(nextLocal);

      try {
        if (exists) {
          const res = await fetch(
            `${API_URL}/api/saved-recipes/${recipe.id}?user_id=${encodeURIComponent(userId)}`,
            { method: 'DELETE' },
          );
          if (!res.ok) throw new Error(`DELETE ${res.status}`);
        } else {
          const res = await fetch(`${API_URL}/api/saved-recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              spoonacular_id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              ready_minutes: null,
              servings: null,
            }),
          });
          if (!res.ok) throw new Error(`POST ${res.status}`);
        }
      } catch (e) {
        console.warn('[MealHistory] favourite sync failed, reverting', e);
        setFavourites(previous);
      }
    },
    [userId, favourites],
  );

  const isFavourite = useCallback(
    (id: number) => favourites.some((f) => f.id === id),
    [favourites],
  );

  const updateRecent = useCallback((recipe: RecentRecipe) => {
    setRecentRecipe(recipe);
  }, []);

  return (
    <MealHistoryContext.Provider
      value={{
        cookedMeals,
        currentStreak,
        cookedMealsSynced,
        favourites,
        favouritesSynced,
        recentRecipe,
        markAsCooked,
        removeCooked,
        toggleFavourite,
        isFavourite,
        setRecentRecipe: updateRecent,
      }}
    >
      {children}
    </MealHistoryContext.Provider>
  );
};

export function useMealHistory(): MealHistoryContextValue {
  const ctx = useContext(MealHistoryContext);
  if (!ctx) throw new Error('useMealHistory must be inside MealHistoryProvider');
  return ctx;
}
