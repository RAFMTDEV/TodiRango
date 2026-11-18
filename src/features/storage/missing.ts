import { Recipe } from '../../types';
import { searchByPantry } from '../recipes/service';

/**
 * Devolve os ids dos ingredientes principais que faltam para a receita,
 * comparando com a despensa (nomes ou ids).
 *
 * Usa o campo `missing` da busca de receitas. A busca omite receitas sem
 * nenhum ingrediente em comum e retorna vazio com a despensa vazia; nesses
 * casos nada da receita está disponível, então tudo falta.
 */
export async function getMissingIngredients(
  recipe: Recipe,
  pantry: string[],
): Promise<string[]> {
  const matches = await searchByPantry(pantry, recipe.keyIngredients.length);
  const match = matches.find((m) => m.recipe.id === recipe.id);
  return match ? match.missing : [...recipe.keyIngredients];
}