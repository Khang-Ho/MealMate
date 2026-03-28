import { useState, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface RecipeResult {
  id: number;
  title: string;
  image: string | null;
  ready_in_minutes: number | null;
  servings: number | null;
  cuisines: string[];
  diets: string[];
  summary: string | null;
}

interface UseRecipeSearchResult {
  results: RecipeResult[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  search: (query: string, cuisine?: string, diet?: string) => Promise<void>;
  reset: () => void;
}

export function useRecipeSearch(): UseRecipeSearchResult {
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const search = useCallback(async (query: string, cuisine?: string, diet?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query, number: '12' });
      if (cuisine) params.append('cuisine', cuisine);
      if (diet) params.append('diet', diet);
      const resp = await fetch(`${API_URL}/api/recipes/search?${params.toString()}`);
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();
      setResults(data.results ?? []);
      setTotalResults(data.total_results ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setTotalResults(0);
  }, []);

  return { results, loading, error, totalResults, search, reset };
}
