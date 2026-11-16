import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Ingredient } from '../../types';

type PantryState = {
  selected: string[];
  customIngredients: Ingredient[];
  toggle: (name: string) => void;
  addCustomIngredient: (name: string, category?: string) => void;
  clear: () => void;
};

export const usePantry = create<PantryState>()(
  persist(
    (set) => ({
      selected: [],
      customIngredients: [],
      toggle: (name) =>
        set((s) => ({
          selected: s.selected.includes(name)
            ? s.selected.filter((n) => n !== name)
            : [...s.selected, name],
        })),
      addCustomIngredient: (rawName, category = 'Meus ingredientes') =>
        set((s) => {
          const name = rawName.trim();
          if (!name) return s;

          const alreadyCustom = s.customIngredients.some(
            (item) => item.name.toLowerCase() === name.toLowerCase()
          );

          const nextCustom = alreadyCustom
            ? s.customIngredients
            : [
                ...s.customIngredients,
                { id: `custom-${name.toLowerCase()}-${Date.now()}`, name, category },
              ];

          const nextSelected = s.selected.includes(name)
            ? s.selected
            : [...s.selected, name];

          return {
            customIngredients: nextCustom,
            selected: nextSelected,
          };
        }),
      clear: () => set({ selected: [] }),
    }),
    {
      name: 'despensa',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);