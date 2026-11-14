import { Text, View } from 'react-native';
import { useFavorites } from '../../features/storage/stores';

// TODO (tarefa 5): listar receitas favoritas com getRecipeById
export default function Favoritos() {
  const ids = useFavorites((s) => s.ids);
  return <View style={{ padding: 20 }}><Text>{ids.length} favoritos</Text></View>;
}
