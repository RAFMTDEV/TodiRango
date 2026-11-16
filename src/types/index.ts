export type Ingredient = {
  id: string;
  name: string;
  category: string;
  alwaysHave?: boolean;
};

export type RecipeStep = { order: number; text: string; timerSeconds?: number };

export type RecipeCategory =
  | "cafe-da-manha"
  | "lanche"
  | "prato-principal"
  | "acompanhamento"
  | "sopa"
  | "salada"
  | "sobremesa"
  | "bebida";

export type Difficulty = "facil" | "media" | "dificil";

export type RecipeIngredient = {
  id: string;
  name: string;
  text: string;
  optional: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  category: RecipeCategory;
  difficulty: Difficulty;
  prepTimeMinutes: number;
  servings: number;
  image: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  keyIngredients: string[];
};

export type PantryMatch = { recipe: Recipe; used: string[]; missing: string[] };
