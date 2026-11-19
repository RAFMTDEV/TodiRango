import { Difficulty, RecipeCategory } from '../../types';

export const CATEGORIES: {
  id: RecipeCategory;
  label: string;
  emoji: string;
}[] = [
  { id: 'prato-principal', label: 'Pratos principais', emoji: '🍲' },
  { id: 'cafe-da-manha', label: 'Café da manhã', emoji: '🍳' },
  { id: 'lanche', label: 'Lanches', emoji: '🥪' },
  { id: 'acompanhamento', label: 'Acompanhamentos', emoji: '🍚' },
  { id: 'sopa', label: 'Sopas', emoji: '🥣' },
  { id: 'salada', label: 'Saladas', emoji: '🥗' },
  { id: 'sobremesa', label: 'Sobremesas', emoji: '🍰' },
  { id: 'bebida', label: 'Bebidas', emoji: '🥤' },
];

export const categoryInfo = (id: RecipeCategory) =>
  CATEGORIES.find((c) => c.id === id) ?? { id, label: id, emoji: '🍽️' };

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: 'Fácil',
  media: 'Média',
  dificil: 'Difícil',
};
