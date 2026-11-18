import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { categoryInfo, DIFFICULTY_LABEL } from '../../features/recipes/categories';
import { useFavorites } from '../../features/storage/stores';
import { Recipe } from '../../types';
import { colors, radius } from '../../ui/theme';

type CardProps = {
  recipe: Recipe;
  onOpen: () => void;
  onRemove: () => void;
};

function FavoriteCard({ recipe, onOpen, onRemove }: CardProps) {
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

  const confirmRemove = (recipe: Recipe) => {
    Alert.alert('Remover favorito', `Remover "${recipe.title}" dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove(recipe.id) },
    ]);
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