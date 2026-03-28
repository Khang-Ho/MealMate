export interface Tag {
  label: string;
  bgColor: string;
  textColor: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  tags?: Tag[];
}

export interface HistoryItem {
  id: string;
  title: string;
  imageUrl: string;
  cookedAgo: string;
}

export interface RecipeStep {
  number: number;
  title: string;
  description: string;
}

export interface IngredientItem {
  name: string;
  quantity: string;
  icon: string;
  inStock: boolean;
}

export interface RecipeDetail extends Recipe {
  category?: string;
  cookTime?: string;
  calories?: string;
  chefTip?: string;
  readyPercentage?: number;
  steps?: RecipeStep[];
  ingredients?: IngredientItem[];
}
