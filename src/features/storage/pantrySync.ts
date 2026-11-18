import { usePantry } from '../pantry/store';
import { ingredientName, toIngredientIds } from '../recipes/service';

type PurchasedItem = { id: string; name: string };

/**
 * Envia um ingrediente comprado para a Despensa, usando apenas a API pública
 * do usePantry (selected, toggle e addCustomIngredient).
 *
 * Devolve true se o ingrediente foi adicionado agora e false se já estava lá.
 */
export function addPurchasedToPantry(item: PurchasedItem): boolean {
  const pantry = usePantry.getState();

  // `selected` guarda nomes (ou ids); comparamos pelo id do ingrediente.
  // Isso evita duplicar e, principalmente, evita que o toggle desmarque.
  if (toIngredientIds(pantry.selected).includes(item.id)) return false;

  // No catálogo, ingredientName(id) devolve o nome oficial (ex.: "Ovo").
  // Fora do catálogo ele devolve o próprio id: é um ingrediente personalizado.
  const catalogName = ingredientName(item.id);
  if (catalogName !== item.id) {
    pantry.toggle(catalogName);
  } else {
    pantry.addCustomIngredient(item.name);
  }
  return true;
}