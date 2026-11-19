import { Recipe } from '../../types';
import { searchByPantry } from '../recipes/service';

export async function getMissingIngredients(recipe: Recipe, pantry: string[]): Promise<string[]> {
  const matches = await searchByPantry(pantry, recipe.keyIngredients.length);
  const match = matches.find((m) => m.recipe.id === recipe.id);
  return match ? match.missing : [...recipe.keyIngredients];
}
