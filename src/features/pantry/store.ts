import { create } from 'zustand';

type PantryState = {
  selected: string[]; // nomes dos ingredientes marcados
  toggle: (name: string) => void;
  clear: () => void;
};

export const usePantry = create<PantryState>((set) => ({
  selected: [],
  toggle: (name) =>
    set((s) => ({
      selected: s.selected.includes(name) ? s.selected.filter((n) => n !== name) : [...s.selected, name],
    })),
  clear: () => set({ selected: [] }),
}));
