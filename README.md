# TodiRango

App de receitas para quando você abre a geladeira e não sabe o que fazer. Você marca o que tem em casa, chacoalha o celular (ou toca em "Sortear receita") e o app sorteia uma receita que dá para fazer com esses ingredientes, com modo cozinha passo a passo e cronômetro.

Feito com Expo (SDK 58), React Native, TypeScript, expo-router, Zustand e Supabase.

## Como rodar

Precisa do **Node.js 22.13 ou mais novo** (`node -v` para conferir).

```bash
npm install
npx expo start
```

Depois disso:

- **No computador:** aperte `w` no terminal para abrir no navegador.
- **No celular:** instale o app **Expo Go** e leia o QR code que aparece no terminal (celular e computador na mesma rede Wi-Fi). Se não conectar, rode `npx expo start --tunnel`.

O arquivo `.env` já vem com o endereço do banco. Sem internet, o app usa as receitas que vêm junto com ele, então funciona do mesmo jeito.

No navegador o chacoalhar não existe, use o botão "Sortear receita". Vibração, tela sempre acesa e notificações só funcionam no celular.

## Funcionalidades

- **Despensa:** ingredientes por categoria, busca, ingredientes personalizados e seleção salva no celular.
- **Sorteio:** chacoalhando ou pelo botão. Prioriza receitas em que não falta nada e não repete as últimas sorteadas.
- **Receita:** mostra o que você tem e o que falta, e manda o que falta para a lista de compras.
- **Modo cozinha:** um passo por tela, cronômetro nos passos que precisam, vibração e notificação quando o tempo acaba, tela sempre acesa.
- **Receitas:** as 124 receitas com busca por nome ou ingrediente e filtro por categoria.
- **Favoritos:** guarda a receita inteira, funciona sem internet.
- **Compras:** lista com o que falta; o que você marca como comprado vai para a Despensa.

## Estrutura

| Pasta | O que tem |
|---|---|
| `src/app` | Telas (abas Despensa, Receitas, Favoritos e Compras; Receita e Modo cozinha) |
| `src/features/recipes` | Acesso ao Supabase, busca e sorteio, receitas locais |
| `src/features/pantry` | Despensa |
| `src/features/shake` | Acelerômetro |
| `src/features/cooking` | Cronômetro e notificações |
| `src/features/storage` | Favoritos e lista de compras |
| `src/ui` | Tema e componentes (Button, Card, Chip, Screen) |
| `supabase/seed.sql` | Tabelas, dados e função de busca do banco |
| `scripts/recipes` | Fonte das receitas e script que gera os dados |

## Banco de dados

Para usar outro projeto do Supabase: rode `supabase/seed.sql` no SQL Editor e troque a URL e a Publishable key no `.env`.

Para editar receitas: mexa em `scripts/recipes/source/` e rode `python3 scripts/recipes/build.py`. Ele valida os dados e gera os JSON de `src/features/recipes/data/` e o `seed.sql`.
