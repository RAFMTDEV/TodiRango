# TodiRango

Copie a pasta `src/` para o projeto Expo (o expo-router lê `src/app`; se o template usa `app/` na raiz, mova as rotas).

```bash
npx expo install expo-sensors expo-haptics expo-keep-awake @react-native-async-storage/async-storage
npx expo install @supabase/supabase-js react-native-url-polyfill
npm install zustand
npx expo start
```

| Tarefa | Pasta |
|---|---|
| 1. API de receitas | `src/features/recipes`, `supabase/`, `scripts/recipes` e `src/app/(tabs)/explorar.tsx` |
| 2. Despensa | `src/features/pantry` e `src/app/(tabs)/index.tsx` |
| 3. Sensores | `src/features/shake` |
| 4. Modo cozinha | `src/features/cooking` e `src/app/cozinha` |
| 5. Favoritos e compras | `src/features/storage` e abas favoritos/compras |
| 6. UI e navegação | `src/ui`, `src/app/_layout.tsx` |

## Banco de receitas

124 receitas e 105 ingredientes. O app funciona sem banco usando `src/features/recipes/data/`; com o Supabase configurado, ele busca de lá e volta para os dados locais se a conexão falhar.

1. Crie um projeto no Supabase, abra o **SQL Editor** e rode `supabase/seed.sql`.
2. Copie `.env.example` para `.env.local` e preencha com a **Project URL** e a **Publishable key** (Project Settings → API Keys).
3. Rode `npx expo start -c` para o Expo ler as variáveis.

Funções em `src/features/recipes/service.ts`:

| Função | Uso |
|---|---|
| `getRandomRecipe(despensa, excluir?)` | sorteio: prioriza as receitas em que falta menos coisa |
| `searchByPantry(despensa, maxFaltando?)` | lista completa com `used` e `missing` de cada receita |
| `getRecipeById(id)` | tela da receita e modo cozinha |
| `listRecipes({ category, query })` | aba Explorar |
| `listIngredients()` / `ingredientName(id)` | catálogo da despensa / nome para a lista de compras |

A despensa pode mandar ids (`ovo`) ou nomes (`Ovo`). Sal, óleo, água, açúcar e pimenta-do-reino contam como sempre disponíveis.

Para editar receitas, mexa em `scripts/recipes/source/` e rode `python3 scripts/recipes/build.py`. Ele valida tudo e gera os JSON de `data/` e o `seed.sql`. Depois rode o `seed.sql` de novo no Supabase (ele recria as tabelas).
