import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface CookedMeal {
  id: number;
  title: string;
  image: string | null;
  cookedAt: Date;
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
  favourites: FavouriteRecipe[];
  favouritesSynced: boolean;
  recentRecipe: RecentRecipe | null;
  markAsCooked: (meal: Omit<CookedMeal, 'cookedAt'>) => void;
  toggleFavourite: (recipe: FavouriteRecipe) => void;
  isFavourite: (id: number) => boolean;
  setRecentRecipe: (recipe: RecentRecipe) => void;
}

const MealHistoryContext = createContext<MealHistoryContextValue | null>(null);

export const MealHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [favourites, setFavourites] = useState<FavouriteRecipe[]>([]);
  const [favouritesSynced, setFavouritesSynced] = useState(false);
  const [recentRecipe, setRecentRecipe] = useState<RecentRecipe | null>(null);

  // Load wishlist from Supabase via FastAPI when Clerk session is ready
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
        const url = `${API_URL}/api/saved-recipes?user_id=${encodeURIComponent(userId)}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('[MealHistory] saved-recipes GET failed', res.status);
          if (!cancelled) setFavouritesSynced(true);
          return;
        }
        const data = await res.json();
        const rows = data.recipes ?? [];
        const mapped: FavouriteRecipe[] = rows.map((r: { spoonacular_id: number; title: string; image: string | null }) => ({
          id: r.spoonacular_id,
          title: r.title,
          image: r.image ?? null,
        }));
        if (!cancelled) {
          setFavourites(mapped);
          setFavouritesSynced(true);
        }
      } catch (e) {
        console.warn('[MealHistory] saved-recipes load error', e);
        if (!cancelled) setFavouritesSynced(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  const markAsCooked = useCallback((meal: Omit<CookedMeal, 'cookedAt'>) => {
    setCookedMeals((prev) => {
      const filtered = prev.filter((m) => m.id !== meal.id);
      return [{ ...meal, cookedAt: new Date() }, ...filtered];
    });
  }, []);

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
          const url = `${API_URL}/api/saved-recipes/${recipe.id}?user_id=${encodeURIComponent(userId)}`;
          const res = await fetch(url, { method: 'DELETE' });
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
        favourites,
        favouritesSynced,
        recentRecipe,
        markAsCooked,
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
