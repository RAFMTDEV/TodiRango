import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRecipeById } from '../../features/recipes/service';
import { useFavorites } from '../../features/storage/stores';
import { Recipe } from '../../types';
import { Button } from '../../ui/Button';
import { colors } from '../../ui/theme';

export default function ReceitaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { ids, toggle } = useFavorites();

  useEffect(() => { getRecipeById(id).then(setRecipe); }, [id]);
  if (!recipe) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>{recipe.title}</Text>
      <Text>{recipe.prepTimeMinutes} min · {recipe.servings} porções</Text>
      {recipe.ingredients.map((i) => <Text key={i.name}>• {i.quantity} {i.name}</Text>)}
      <Button label={ids.includes(recipe.id) ? 'Remover dos favoritos' : 'Favoritar'} variant="outline" onPress={() => toggle(recipe.id)} />
      <Button label="Cozinhar" onPress={() => router.push(`/cozinha/${recipe.id}`)} />
    </ScrollView>
  );
}
