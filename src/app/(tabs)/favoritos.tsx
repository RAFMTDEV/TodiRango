import { Text, View } from 'react-native';
import { useFavorites } from '../../features/storage/stores';

// TODO (tarefa 5): listar receitas favoritas com getRecipeById
export default function Favoritos() {
  const total = useFavorites((s) => s.items.length);
  return <View style={{ padding: 20 }}><Text>{total} favoritos</Text></View>;
}