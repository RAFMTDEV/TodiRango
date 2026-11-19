import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { usePantry } from '../../features/pantry/store';
import { categoryInfo, DIFFICULTY_LABEL } from '../../features/recipes/categories';
import { getMissingIngredients } from '../../features/storage/missing';
import { useFavorites, useShoppingList } from '../../features/storage/stores';
import { Recipe } from '../../types';
import { confirmAlert, showAlert } from '../../ui/alert';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { colors } from '../../ui/theme';

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
    <Card style={{ gap: 6 }}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Abrir receita ${recipe.title}`}
        style={({ pressed }) => ({ gap: 6, opacity: pressed ? 0.7 : 1 })}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.green }}>
          {category.emoji} {category.label}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>{recipe.title}</Text>
        <Text style={{ color: colors.muted }}>
          {recipe.prepTimeMinutes} min · {recipe.servings}{' '}
          {recipe.servings === 1 ? 'porção' : 'porções'} · {DIFFICULTY_LABEL[recipe.difficulty]}
        </Text>
      </Pressable>

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
        <Text style={{ color: colors.green, fontWeight: '700' }}>Remover dos favoritos</Text>
      </Pressable>
    </Card>
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
    confirmAlert('Remover favorito', `Remover "${recipe.title}" dos favoritos?`, 'Remover', () =>
      remove(recipe.id),
    );
  };

  const handleAddMissing = async (recipe: Recipe) => {
    if (busyId) return;
    setBusyId(recipe.id);
    try {
      const missing = await getMissingIngredients(recipe, pantry);
      if (missing.length === 0) {
        showAlert('Tudo certo', 'Você já tem todos os ingredientes principais desta receita.');
        return;
      }
      const added = addMissing(missing);
      showAlert(
        added > 0 ? 'Lista atualizada' : 'Nada novo',
        added > 0
          ? `${added} ingrediente${added === 1 ? '' : 's'} adicionado${added === 1 ? '' : 's'} à lista de compras.`
          : 'Os ingredientes que faltam já estão na lista de compras.',
      );
    } catch {
      showAlert('Erro', 'Não foi possível verificar os ingredientes agora.');
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
            Abra uma receita e toque em Favoritar para guardá-la aqui. Ela fica disponível mesmo sem
            internet.
          </Text>
        </View>
      }
    />
  );
}
