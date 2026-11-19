import { create } from 'zustand';

type HistoryState = {
  recentIds: string[];
  add: (id: string) => void;
  clear: () => void;
};

export const useRecipeHistory = create<HistoryState>((set) => ({
  recentIds: [],

  add: (id) =>
    set((state) => ({
      recentIds: [id, ...state.recentIds.filter((item) => item !== id)].slice(0, 3),
    })),

  clear: () => set({ recentIds: [] }),
}));
