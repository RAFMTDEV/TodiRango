import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { usePantry } from '../../features/pantry/store';
import { categoryInfo, DIFFICULTY_LABEL } from '../../features/recipes/categories';
import { getMissingIngredients } from '../../features/storage/missing';
import { useFavorites, useShoppingList } from '../../features/storage/stores';
import { Recipe } from '../../types';
import { Button } from '../../ui/Button';
import { colors, radius } from '../../ui/theme';

type CardProps = {
  recipe: Recipe;
  onOpen: () => void;
  onRemove: () => void;
  onAddMissing: () => void;
  busy: boolean;
};

function FavoriteCard({ recipe, onOpen, onRemove, onAddMissing, busy }: CardProps) {
  const category = categoryInfo(recipe.category);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Abrir receita ${recipe.title}`}
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.green }}>
        {category.emoji} {category.label}
      </Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>
        {recipe.title}
      </Text>
      <Text style={{ color: colors.muted }}>
        {recipe.prepTimeMinutes} min · {recipe.servings} porções ·{' '}
        {DIFFICULTY_LABEL[recipe.difficulty]}
      </Text>

      <View style={{ marginTop: 6 }}>
        <Button
          label={busy ? 'Verificando...' : 'Adicionar o que falta'}
          variant="outline"
          onPress={onAddMissing}
          disabled={busy}
        />
      </View>

      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${recipe.title} dos favoritos`}
        hitSlop={8}
        style={{ alignSelf: 'flex-start', paddingVertical: 6 }}
      >
        <Text style={{ color: colors.green, fontWeight: '700' }}>
          Remover dos favoritos
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function Favoritos() {
  const router = useRouter();
  const items = useFavorites((s) => s.items);
  const remove = useFavorites((s) => s.remove);

  const pantry = usePantry((s) => s.selected);
  const addMissing = useShoppingList((s) => s.addMissing);
  const [busyId, setBusyId] = useState<string | null>(null);

  const confirmRemove = (recipe: Recipe) => {
    Alert.alert('Remover favorito', `Remover "${recipe.title}" dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove(recipe.id) },
    ]);
  };

  const handleAddMissing = async (recipe: Recipe) => {
    if (busyId) return;
    setBusyId(recipe.id);
    try {
      const missing = await getMissingIngredients(recipe, pantry);
      if (missing.length === 0) {
        Alert.alert('Tudo certo', 'Você já tem todos os ingredientes principais desta receita.');
        return;
      }
      const added = addMissing(missing);
      Alert.alert(
        added > 0 ? 'Lista atualizada' : 'Nada novo',
        added > 0
          ? `${added} ingrediente${added === 1 ? '' : 's'} adicionado${added === 1 ? '' : 's'} à lista de compras.`
          : 'Os ingredientes que faltam já estão na lista de compras.',
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível verificar os ingredientes agora.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        gap: 12,
        flexGrow: 1,
      }}
      data={items}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        items.length > 0 ? (
          <Text style={{ color: colors.muted, marginBottom: 4 }}>
            {items.length} {items.length === 1 ? 'receita salva' : 'receitas salvas'}
          </Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <FavoriteCard
          recipe={item}
          onOpen={() => router.push(`/receita/${item.id}`)}
          onRemove={() => confirmRemove(item)}
          onAddMissing={() => handleAddMissing(item)}
          busy={busyId === item.id}
        />
      )}
      ListEmptyComponent={
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 40 }}>🤍</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>
            Nenhum favorito ainda
          </Text>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            Abra uma receita e toque em Favoritar para guardá-la aqui. Ela fica
            disponível mesmo sem internet.
          </Text>
        </View>
      }
    />
  );
}