import { Recipe } from '../../types';
import { RECIPES } from './mock';

const norm = (s: string) => s.trim().toLowerCase();

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return RECIPES.find((r) => r.id === id) ?? null;
}

/** Sorteia uma receita que use pelo menos um dos ingredientes marcados.
 *  TODO: decidir se exige todos os ingredientes e priorizar quem usa mais. */
export async function getRandomRecipe(have: string[]): Promise<Recipe | null> {
  const set = new Set(have.map(norm));
  const matches = RECIPES.filter((r) => r.ingredients.some((i) => set.has(norm(i.name))));
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}
