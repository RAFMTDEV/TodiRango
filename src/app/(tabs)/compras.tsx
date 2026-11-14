import { Text, View } from 'react-native';
import { useShoppingList } from '../../features/storage/stores';

// TODO (tarefa 5): lista com adicionar, marcar e remover itens
export default function Compras() {
  const items = useShoppingList((s) => s.items);
  return <View style={{ padding: 20 }}><Text>{items.length} itens na lista</Text></View>;
}
