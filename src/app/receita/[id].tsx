import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { usePantry } from '../../features/pantry/store';
import { categoryInfo, DIFFICULTY_LABEL } from '../../features/recipes/categories';
import { useRecipeHistory } from '../../features/recipes/history';
import {
  getRandomRecipe,
  getRecipeById,
  isAlwaysAvailable,
  toIngredientIds,
} from '../../features/recipes/service';
import { useFavorites, useShoppingList } from '../../features/storage/stores';
import { Recipe } from '../../types';
import { showAlert } from '../../ui/alert';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Screen } from '../../ui/Screen';
import { colors, font } from '../../ui/theme';

export default function ReceitaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const { ids, toggle } = useFavorites();
  const addMissing = useShoppingList((s) => s.addMissing);
  const { selected } = usePantry();
  const { recentIds, add, clear } = useRecipeHistory();

  useEffect(() => {
    setRecipe(null);
    getRecipeById(id).then(setRecipe);
  }, [id]);

  const pantryIds = useMemo(() => new Set(toIngredientIds(selected)), [selected]);

  const sortearOutra = async () => {
    if (loading) return;

    if (selected.length === 0) {
      showAlert('Despensa vazia', 'Volte e selecione ingredientes para sortear outra receita.');
      return;
    }

    setLoading(true);

    try {
      let next = await getRandomRecipe(selected, recentIds);

      if (!next && recentIds.length > 0) {
        clear();
        next = await getRandomRecipe(selected);
      }

      if (!next) {
        showAlert(
          'Nenhuma receita encontrada',
          'Não encontramos outra receita com esses ingredientes.',
        );
        return;
      }

      add(next.id);
      router.replace(`/receita/${next.id}`);
    } catch {
      showAlert('Erro', 'Não foi possível sortear outra receita.');
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) return null;

  const category = categoryInfo(recipe.category);
  const missing = recipe.keyIngredients.filter((i) => !pantryIds.has(i));
  const haveCount = recipe.keyIngredients.length - missing.length;
  const isFavorite = ids.includes(recipe.id);

  const handleAddMissing = () => {
    const added = addMissing(missing);
    showAlert(
      added > 0 ? 'Lista de compras atualizada' : 'Nada novo',
      added > 0
        ? `${added} ${added === 1 ? 'ingrediente foi adicionado' : 'ingredientes foram adicionados'} à lista.`
        : 'Esses ingredientes já estão na sua lista de compras.',
    );
  };

  return (
    <Screen scroll>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: font.small, fontWeight: '700', color: colors.green }}>
          {category.emoji} {category.label}
        </Text>
        <Text style={{ fontSize: font.title, fontWeight: '800', color: colors.ink }}>
          {recipe.title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: font.body }}>
          {recipe.prepTimeMinutes} min · {recipe.servings}{' '}
          {recipe.servings === 1 ? 'porção' : 'porções'} · {DIFFICULTY_LABEL[recipe.difficulty]}
        </Text>
      </View>

      <Card style={{ gap: 10 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ fontSize: font.subtitle, fontWeight: '800', color: colors.ink }}>
            Ingredientes
          </Text>
          <Text style={{ fontSize: font.small, fontWeight: '700', color: colors.muted }}>
            Você tem {haveCount} de {recipe.keyIngredients.length}
          </Text>
        </View>

        {recipe.ingredients.map((i) => {
          const have = pantryIds.has(i.id) || isAlwaysAvailable(i.id);
          const status = have ? 'tem' : i.optional ? 'opcional' : 'falta';
          return (
            <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text
                style={{
                  width: 64,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '800',
                  paddingVertical: 3,
                  borderRadius: 10,
                  overflow: 'hidden',
                  color:
                    status === 'tem' ? colors.green : status === 'falta' ? '#B4541A' : colors.muted,
                  backgroundColor:
                    status === 'tem'
                      ? colors.greenSoft
                      : status === 'falta'
                        ? colors.orangeSoft
                        : colors.bg,
                }}
              >
                {status === 'tem' ? '✓ tem' : status}
              </Text>
              <Text style={{ flex: 1, fontSize: font.body, color: colors.ink }}>{i.text}</Text>
            </View>
          );
        })}

        {missing.length > 0 ? (
          <Button
            label={`Adicionar o que falta à lista (${missing.length})`}
            variant="outline"
            onPress={handleAddMissing}
          />
        ) : (
          <Text style={{ color: colors.green, fontWeight: '700' }}>
            Você tem tudo o que precisa para essa receita.
          </Text>
        )}
      </Card>

      <Text style={{ color: colors.muted }}>{recipe.steps.length} passos no modo cozinha</Text>

      <Button label="Começar a cozinhar" onPress={() => router.push(`/cozinha/${recipe.id}`)} />
      <Button
        label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
        variant="outline"
        onPress={() => toggle(recipe.id)}
      />
      <Button
        label={loading ? 'Sorteando...' : 'Sortear outra'}
        variant="outline"
        onPress={sortearOutra}
        disabled={loading}
      />
    </Screen>
  );
}
