import {
  Difficulty,
  Ingredient,
  PantryMatch,
  Recipe,
  RecipeCategory,
} from "../../types";
import localIngredients from "./data/ingredients.json";
import localRecipes from "./data/recipes.json";
import { filterRecipes, matchPantry, normalize, RecipeFilter } from "./search";
import { supabase } from "./supabase";

const LOCAL_RECIPES = localRecipes as Recipe[];
const CATALOG = localIngredients as Ingredient[];
const TIMEOUT_MS = 6000;

type Source = "supabase" | "local";
let source: Source = "local";
export const dataSource = () => source;

const warn = (where: string, err: unknown) => {
  if (__DEV__) console.warn(`[recipes] ${where}: usando dados locais`, err);
};

function withTimeout<T>(promise: PromiseLike<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout de ${ms} ms`)),
      ms,
    );
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

type RecipeRow = {
  id: string;
  title: string;
  category: RecipeCategory;
  difficulty: Difficulty;
  prep_time_minutes: number;
  servings: number;
  image: string | null;
  ingredients: Recipe["ingredients"];
  steps: Recipe["steps"];
  key_ingredients: string[];
};

const fromRow = (r: RecipeRow): Recipe => ({
  id: r.id,
  title: r.title,
  category: r.category,
  difficulty: r.difficulty,
  prepTimeMinutes: r.prep_time_minutes,
  servings: r.servings,
  image: r.image,
  ingredients: r.ingredients,
  steps: r.steps,
  keyIngredients: r.key_ingredients,
});

let cache: Recipe[] | null = null;
let pending: Promise<Recipe[]> | null = null;

export async function loadRecipes(force = false): Promise<Recipe[]> {
  if (cache && !force) return cache;
  if (pending) return pending;

  pending = (async () => {
    try {
      if (!supabase) throw new Error("Supabase não configurado");
      const { data, error } = await withTimeout(
        supabase.from("recipes").select("*").order("title"),
      );
      if (error) throw error;
      if (!data?.length) throw new Error("tabela recipes vazia");
      cache = (data as RecipeRow[]).map(fromRow);
      source = "supabase";
    } catch (err) {
      warn("loadRecipes", err);
      cache = LOCAL_RECIPES;
      source = "local";
    }
    return cache;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}

export async function listRecipes(
  filter: RecipeFilter = {},
): Promise<Recipe[]> {
  return filterRecipes(await loadRecipes(), filter);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await loadRecipes();
  return recipes.find((r) => r.id === id) ?? null;
}

const byId = new Map(CATALOG.map((i) => [i.id, i]));
const byName = new Map(CATALOG.map((i) => [normalize(i.name), i.id]));

export function toIngredientIds(values: string[]): string[] {
  const ids = values.map((v) =>
    byId.has(v) ? v : (byName.get(normalize(v)) ?? normalize(v)),
  );
  return [...new Set(ids)];
}

export const ingredientName = (id: string) => byId.get(id)?.name ?? id;

export async function searchByPantry(
  pantry: string[],
  maxMissing = 2,
): Promise<PantryMatch[]> {
  const ids = toIngredientIds(pantry);
  if (ids.length === 0) return [];

  try {
    if (!supabase) throw new Error("Supabase não configurado");
    const { data, error } = await withTimeout(
      supabase.rpc("search_recipes", { pantry: ids, max_missing: maxMissing }),
    );
    if (error) throw error;
    source = "supabase";
    return (data ?? []) as PantryMatch[];
  } catch (err) {
    warn("searchByPantry", err);
    source = "local";
    return matchPantry(await loadRecipes(), ids, maxMissing);
  }
}

export async function getRandomRecipe(
  have: string[],
  excludedIds: string[] = [],
): Promise<Recipe | null> {
  const excluded = new Set(excludedIds);
  const available = (await searchByPantry(have)).filter(
    (m) => !excluded.has(m.recipe.id),
  );
  if (available.length === 0) return null;
  const best = available.filter(
    (m) => m.missing.length === available[0].missing.length,
  );
  let pick = Math.random() * best.reduce((sum, m) => sum + m.used.length, 0);
  for (const m of best) {
    pick -= m.used.length;
    if (pick < 0) return m.recipe;
  }
  return best[0].recipe;
}

let ingredientsCache: Ingredient[] | null = null;

export async function listIngredients(): Promise<Ingredient[]> {
  if (ingredientsCache) return ingredientsCache;
  try {
    if (!supabase) throw new Error("Supabase não configurado");
    const { data, error } = await withTimeout(
      supabase.from("ingredients").select("*"),
    );
    if (error) throw error;
    if (!data?.length) throw new Error("tabela ingredients vazia");
    ingredientsCache = (
      data as {
        id: string;
        name: string;
        category: string;
        always_have: boolean;
      }[]
    ).map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      alwaysHave: i.always_have,
    }));
  } catch (err) {
    warn("listIngredients", err);
    ingredientsCache = CATALOG;
  }
  return ingredientsCache;
}
