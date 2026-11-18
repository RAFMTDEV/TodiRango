import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { ShoppingItem, useShoppingList } from '../../features/storage/stores';
import { Button } from '../../ui/Button';
import { colors, radius } from '../../ui/theme';

type RowProps = {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
};

function ItemRow({ item, onToggle, onRemove }: RowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        minHeight: 56,
        gap: 12,
      }}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.done }}
        accessibilityLabel={item.name}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 2,
            borderColor: colors.green,
            backgroundColor: item.done ? colors.green : colors.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.done && <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>}
        </View>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: item.done ? colors.muted : colors.ink,
            textDecorationLine: item.done ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </Text>
      </Pressable>

      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${item.name} da lista`}
        hitSlop={8}
        style={{ padding: 8 }}
      >
        <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
      </Pressable>
    </View>
  );
}

export default function Compras() {
  const items = useShoppingList((s) => s.items);
  const add = useShoppingList((s) => s.add);
  const toggle = useShoppingList((s) => s.toggle);
  const remove = useShoppingList((s) => s.remove);
  const clearDone = useShoppingList((s) => s.clearDone);

  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const pendingCount = items.filter((i) => !i.done).length;
  const doneCount = items.length - pendingCount;
  // pendentes primeiro; o sort é estável, então a ordem de inclusão se mantém
  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  const handleAdd = () => {
    const name = text.trim();
    if (!name) return;
    const added = add(name);
    if (added) {
      setText('');
      setMessage(null);
    } else {
      setMessage(`"${name}" já está na lista.`);
    }
  };

  const handleToggle = (item: ShoppingItem) => {
    const sentToPantry = toggle(item.id);
    setMessage(sentToPantry ? `${item.name} foi adicionado à Despensa.` : null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            if (message) setMessage(null);
          }}
          onSubmitEditing={handleAdd}
          placeholder="Ex.: Tomate"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          autoCapitalize="sentences"
          accessibilityLabel="Novo item da lista de compras"
          style={{
            flex: 1,
            height: 56,
            borderRadius: radius.button,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: 20,
            fontSize: 17,
            color: colors.ink,
          }}
        />
        <View style={{ width: 120 }}>
          <Button label="Adicionar" onPress={handleAdd} disabled={!text.trim()} />
        </View>
      </View>

      {message && <Text style={{ color: colors.muted }}>{message}</Text>}

      {items.length > 0 && (
        <Text style={{ color: colors.muted }}>
          {pendingCount} para comprar · {doneCount} comprado{doneCount === 1 ? '' : 's'}
        </Text>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            onToggle={() => handleToggle(item)}
            onRemove={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>
              Lista vazia
            </Text>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>
              Digite um ingrediente acima para começar.
            </Text>
          </View>
        }
      />

      {doneCount > 0 && (
        <Button label="Limpar comprados" variant="outline" onPress={clearDone} />
      )}
    </View>
  );
}