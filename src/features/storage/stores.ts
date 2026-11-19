import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Recipe } from '../../types';
import { getRecipeById, ingredientName, toIngredientIds } from '../recipes/service';
import { addPurchasedToPantry } from './pantrySync';

type FavState = {
  ids: string[];
  items: Recipe[];
  add: (recipe: Recipe) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      items: [],
      add: (recipe) =>
        set((s) =>
          s.ids.includes(recipe.id)
            ? s
            : { ids: [recipe.id, ...s.ids], items: [recipe, ...s.items] },
        ),
      toggle: (id) => {
        if (get().ids.includes(id)) {
          get().remove(id);
          return;
        }
        getRecipeById(id)
          .then((recipe) => {
            if (recipe) get().add(recipe);
          })
          .catch((err) => {
            if (__DEV__) console.warn('[favoritos] não foi possível salvar', err);
          });
      },
      remove: (id) =>
        set((s) => ({
          ids: s.ids.filter((i) => i !== id),
          items: s.items.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'favoritos',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ids: s.ids, items: s.items }),
      migrate: () => ({ ids: [], items: [] }),
    },
  ),
);

export const useIsFavorite = (id: string) => useFavorites((s) => s.ids.includes(id));

export type ShoppingItem = { id: string; name: string; done: boolean };

type ShopState = {
  items: ShoppingItem[];
  add: (name: string) => boolean;
  addMissing: (ids: string[]) => number;
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clearDone: () => void;
};

export const useShoppingList = create<ShopState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (rawName) => {
        const name = rawName.trim();
        if (!name) return false;
        const [id] = toIngredientIds([name]);
        if (get().items.some((i) => i.id === id)) return false;
        const label = ingredientName(id);
        set((s) => ({
          items: [...s.items, { id, name: label === id ? name : label, done: false }],
        }));
        return true;
      },
      addMissing: (rawIds) => {
        const wanted = toIngredientIds(rawIds);
        const existing = new Set(get().items.map((i) => i.id));
        const toAdd = wanted.filter((id) => !existing.has(id));
        set((s) => ({
          items: [
            ...s.items.map((i) => (wanted.includes(i.id) ? { ...i, done: false } : i)),
            ...toAdd.map((id) => ({ id, name: ingredientName(id), done: false })),
          ],
        }));
        return toAdd.length;
      },
      toggle: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return false;
        const done = !item.done;
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, done } : i)),
        }));
        return done ? addPurchasedToPantry(item) : false;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clearDone: () => set((s) => ({ items: s.items.filter((i) => !i.done) })),
    }),
    { name: 'compras', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
