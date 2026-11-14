# TodiRango

Copie a pasta `src/` para o projeto Expo (o expo-router lê `src/app`; se o template usa `app/` na raiz, mova as rotas).

```bash
npx expo install expo-sensors expo-haptics expo-keep-awake @react-native-async-storage/async-storage
npm install zustand
npx expo start
```

| Tarefa | Pasta |
|---|---|
| 1. API de receitas | `src/features/recipes` |
| 2. Despensa | `src/features/pantry` e `src/app/(tabs)/index.tsx` |
| 3. Sensores | `src/features/shake` |
| 4. Modo cozinha | `src/features/cooking` e `src/app/cozinha` |
| 5. Favoritos e compras | `src/features/storage` e abas favoritos/compras |
| 6. UI e navegação | `src/ui`, `src/app/_layout.tsx` |
