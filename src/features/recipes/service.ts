import { Recipe } from '../../types';
import { RECIPES } from './mock';

const norm = (s: string) => s.trim().toLowerCase();

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return RECIPES.find((r) => r.id === id) ?? null;
}

/** Sorteia uma receita usando os ingredientes selecionados,
 * evitando as receitas que já apareceram recentemente.
 */
export async function getRandomRecipe(
  have: string[],
  excludedIds: string[] = []
): Promise<Recipe | null> {
  const ingredients = new Set(have.map(norm));
  const excluded = new Set(excludedIds);

  const matches = RECIPES.filter((recipe) =>
    recipe.ingredients.some((ingredient) =>
      ingredients.has(norm(ingredient.name))
    )
  );

  const available = matches.filter(
    (recipe) => !excluded.has(recipe.id)
  );

  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
}
