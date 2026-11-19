import { PantryMatch, Recipe, RecipeCategory } from '../../types';

const FROM = 'áàâãäéèêëíìîïóòôõöúùûüç';
const TO = 'aaaaaeeeeiiiiooooouuuuc';

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[áàâãäéèêëíìîïóòôõöúùûüç]/g, (c) => TO[FROM.indexOf(c)])
    .trim();

export function matchPantry(recipes: Recipe[], pantry: string[], maxMissing = 2): PantryMatch[] {
  const have = new Set(pantry);
  return recipes
    .map((recipe) => ({
      recipe,
      used: recipe.keyIngredients.filter((i) => have.has(i)),
      missing: recipe.keyIngredients.filter((i) => !have.has(i)),
      rand: Math.random(),
    }))
    .filter((m) => m.used.length > 0 && m.missing.length <= maxMissing)
    .sort((a, b) => a.missing.length - b.missing.length || a.rand - b.rand)
    .map(({ recipe, used, missing }) => ({ recipe, used, missing }));
}

export type RecipeFilter = { category?: RecipeCategory | null; query?: string };

export function filterRecipes(recipes: Recipe[], { category, query }: RecipeFilter = {}): Recipe[] {
  const q = query ? normalize(query) : '';
  return recipes
    .filter((r) => !category || r.category === category)
    .filter(
      (r) =>
        !q ||
        normalize(r.title).includes(q) ||
        r.ingredients.some((i) => normalize(i.name).includes(q)),
    )
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
}
