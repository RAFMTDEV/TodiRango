import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavState = { ids: string[]; toggle: (id: string) => void };
export const useFavorites = create<FavState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id] })),
    }),
    { name: 'favoritos', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

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

