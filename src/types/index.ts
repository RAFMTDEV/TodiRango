export type Ingredient = { id: string; name: string; category: string };

export type RecipeStep = { order: number; text: string; timerSeconds?: number };

export type Recipe = {
  id: string;
  title: string;
  prepTimeMinutes: number;
  servings: number;
  ingredients: { name: string; quantity?: string }[];
  steps: RecipeStep[];
};
