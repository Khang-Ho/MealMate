import React, { createContext, useCallback, useContext, useState } from 'react';

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
  recentRecipe: RecentRecipe | null;
  markAsCooked: (meal: Omit<CookedMeal, 'cookedAt'>) => void;
  toggleFavourite: (recipe: FavouriteRecipe) => void;
  isFavourite: (id: number) => boolean;
  setRecentRecipe: (recipe: RecentRecipe) => void;
}

const MealHistoryContext = createContext<MealHistoryContextValue | null>(null);

export const MealHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [favourites, setFavourites] = useState<FavouriteRecipe[]>([]);
  const [recentRecipe, setRecentRecipe] = useState<RecentRecipe | null>(null);

  const markAsCooked = useCallback((meal: Omit<CookedMeal, 'cookedAt'>) => {
    setCookedMeals((prev) => {
      // move to top if already exists
      const filtered = prev.filter((m) => m.id !== meal.id);
      return [{ ...meal, cookedAt: new Date() }, ...filtered];
    });
  }, []);

  const toggleFavourite = useCallback((recipe: FavouriteRecipe) => {
    setFavourites((prev) => {
      const exists = prev.some((f) => f.id === recipe.id);
      return exists ? prev.filter((f) => f.id !== recipe.id) : [recipe, ...prev];
    });
  }, []);

  const isFavourite = useCallback(
    (id: number) => favourites.some((f) => f.id === id),
    [favourites],
  );

  const updateRecent = useCallback((recipe: RecentRecipe) => {
    setRecentRecipe(recipe);
  }, []);

  return (
    <MealHistoryContext.Provider
      value={{ cookedMeals, favourites, recentRecipe, markAsCooked, toggleFavourite, isFavourite, setRecentRecipe: updateRecent }}
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
