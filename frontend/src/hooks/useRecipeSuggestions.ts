import { useState, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface SuggestedRecipe {
  id: number;
  title: string;
  image: string | null;
  usedIngredientCount: number;
  missedIngredientCount: number;
  likes: number;
}

export interface UseRecipeSuggestionsResult {
  suggestions: SuggestedRecipe[];
  loading: boolean;
  error: string | null;
  fetch: (ingredients: string[], number?: number) => Promise<void>;
  clear: () => void;
}

export function useRecipeSuggestions(): UseRecipeSuggestionsResult {
  const [suggestions, setSuggestions] = useState<SuggestedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (ingredients: string[], number = 6) => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ingredients: ingredients.join(','),
        number: String(number),
      });
      const resp = await fetch(`${API_URL}/api/recipes/suggest?${params}`, {
        signal: AbortSignal.timeout(12000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setSuggestions(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, fetch: fetchSuggestions, clear };
}
