import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Recipe } from '../../types';
import { getRecipeById } from '../recipes/service';

type FavState = {
  ids: string[]; // mantido: a tela da receita já usa
  items: Recipe[]; // receitas completas (funciona offline)
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
      // v0 guardava só ids. Descartamos o formato antigo com segurança.
      migrate: () => ({ ids: [], items: [] }),
    },
  ),
);

export const useIsFavorite = (id: string) =>
  useFavorites((s) => s.ids.includes(id));

type Item = { id: string; name: string; done: boolean };
type ShopState = {
  items: Item[];
  add: (name: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};
export const useShoppingList = create<ShopState>()(
  persist(
    (set) => ({
      items: [],
      add: (name) => set((s) => ({ items: [...s.items, { id: String(Date.now()), name, done: false }] })),
      toggle: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'compras', storage: createJSONStorage(() => AsyncStorage) },
  ),
);