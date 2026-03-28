export type RootStackParamList = {
  Home: undefined;
  RecipeSearch: { query?: string; cuisine?: string };
  IngredientChecklist: {
    recipeId: number;
    recipeTitle: string;
    recipeImage?: string;
  };
  Inventory: undefined;
  MarketMap: { missingIngredients?: string[] } | undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};
