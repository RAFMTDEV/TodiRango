import { Recipe } from '../../types';

// Receitas de exemplo. A pessoa da tarefa 1 troca por API ou JSON próprio.
export const RECIPES: Recipe[] = [
  {
    id: 'omelete', title: 'Omelete de queijo e tomate', prepTimeMinutes: 15, servings: 2,
    ingredients: [{ name: 'ovo', quantity: '3' }, { name: 'tomate', quantity: '1' }, { name: 'queijo', quantity: 'a gosto' }],
    steps: [
      { order: 1, text: 'Pique o tomate e rale ou corte o queijo.' },
      { order: 2, text: 'Bata os ovos com sal e despeje na frigideira quente.', timerSeconds: 150 },
      { order: 3, text: 'Adicione o tomate e o queijo, dobre e sirva.' },
    ],
  },
  {
    id: 'macarrao-alho', title: 'Macarrão alho e óleo', prepTimeMinutes: 20, servings: 2,
    ingredients: [{ name: 'macarrão', quantity: '200 g' }, { name: 'alho', quantity: '4 dentes' }],
    steps: [
      { order: 1, text: 'Cozinhe o macarrão em água com sal.', timerSeconds: 540 },
      { order: 2, text: 'Doure o alho fatiado no azeite.' },
      { order: 3, text: 'Misture tudo e sirva.' },
    ],
  },
  {
    id: 'tapioca-queijo', title: 'Tapioca de queijo', prepTimeMinutes: 10, servings: 1,
    ingredients: [{ name: 'tapioca', quantity: '4 colheres' }, { name: 'queijo', quantity: '2 fatias' }],
    steps: [
      { order: 1, text: 'Espalhe a tapioca na frigideira quente.', timerSeconds: 60 },
      { order: 2, text: 'Recheie com queijo, dobre e sirva.' },
    ],
  },
];
