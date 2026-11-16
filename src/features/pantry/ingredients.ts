import { Ingredient } from "../../types";
import catalog from "../recipes/data/ingredients.json";

export const INGREDIENTS: Ingredient[] = (catalog as Ingredient[]).filter(
  (i) => !i.alwaysHave,
);
