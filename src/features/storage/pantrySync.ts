import { usePantry } from '../pantry/store';
import { ingredientName, toIngredientIds } from '../recipes/service';

type PurchasedItem = { id: string; name: string };

export function addPurchasedToPantry(item: PurchasedItem): boolean {
  const pantry = usePantry.getState();

  if (toIngredientIds(pantry.selected).includes(item.id)) return false;

  const catalogName = ingredientName(item.id);
  if (catalogName !== item.id) {
    pantry.toggle(catalogName);
  } else {
    pantry.addCustomIngredient(item.name);
  }
  return true;
}
