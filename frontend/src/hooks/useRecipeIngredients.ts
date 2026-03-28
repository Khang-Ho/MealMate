import { useState, useEffect } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface RecipeIngredient {
  id: number | null;
  name: string;
  original: string;
  amount: number | null;
  unit: string | null;
  image: string | null;
}

export interface RecipeDetail {
  recipe_id: number;
  title: string;
  image: string | null;
  ready_in_minutes: number | null;
  servings: number | null;
  ingredients: RecipeIngredient[];
}

interface UseRecipeIngredientsResult {
  detail: RecipeDetail | null;
  loading: boolean;
  error: string | null;
}

export function useRecipeIngredients(recipeId: number | null): UseRecipeIngredientsResult {
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/recipes/${recipeId}/ingredients`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data: RecipeDetail) => setDetail(data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [recipeId]);

  return { detail, loading, error };
}
