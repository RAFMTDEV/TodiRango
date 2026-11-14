import { Ingredient } from '../../types';

const mk = (category: string, names: string[]): Ingredient[] =>
  names.map((name) => ({ id: name.toLowerCase(), name, category }));

export const INGREDIENTS: Ingredient[] = [
  ...mk('Ovos e laticínios', ['Ovo', 'Queijo', 'Leite', 'Manteiga']),
  ...mk('Hortifruti', ['Tomate', 'Cebola', 'Alho', 'Cenoura', 'Batata']),
  ...mk('Despensa seca', ['Macarrão', 'Arroz', 'Tapioca', 'Feijão']),
];
