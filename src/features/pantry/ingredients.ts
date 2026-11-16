import { Ingredient } from '../../types';

const mk = (category: string, names: string[]): Ingredient[] =>
  names.map((name) => ({ id: name.toLowerCase(), name, category }));

export const INGREDIENTS: Ingredient[] = [
  ...mk('Ovos e laticínios', ['Ovo', 'Queijo', 'Leite', 'Manteiga', 'Requeijão', 'Creme de leite']),
  ...mk('Hortifruti', ['Tomate', 'Cebola', 'Alho', 'Cenoura', 'Batata', 'Banana', 'Limão']),
  ...mk('Proteínas', ['Frango', 'Carne moída', 'Atum', 'Presunto', 'Linguiça']),
  ...mk('Despensa seca', ['Macarrão', 'Arroz', 'Tapioca', 'Feijão', 'Farinha de trigo', 'Aveia']),
];