import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";

import { getRandomRecipe, getRecipeById } from "../../features/recipes/service";

import { usePantry } from "../../features/pantry/store";
import { useRecipeHistory } from "../../features/recipes/history";
import { useFavorites } from "../../features/storage/stores";
import { Recipe } from "../../types";
import { Button } from "../../ui/Button";
import { colors } from "../../ui/theme";

export default function ReceitaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const { ids, toggle } = useFavorites();
  const { selected } = usePantry();
  const { recentIds, add, clear } = useRecipeHistory();

  useEffect(() => {
    setRecipe(null);
    getRecipeById(id).then(setRecipe);
  }, [id]);

  const sortearOutra = async () => {
    if (loading) return;

    if (selected.length === 0) {
      Alert.alert(
        "Despensa vazia",
        "Volte e selecione ingredientes para sortear outra receita.",
      );
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
        Alert.alert(
          "Nenhuma receita encontrada",
          "Não encontramos outra receita com esses ingredientes.",
        );
        return;
      }

      add(next.id);
      router.replace(`/receita/${next.id}`);
    } catch {
      Alert.alert("Erro", "Não foi possível sortear outra receita.");
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) return null;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        gap: 12,
        backgroundColor: colors.bg,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink }}>
        {recipe.title}
      </Text>

      <Text style={{ color: colors.muted }}>
        {recipe.prepTimeMinutes} min · {recipe.servings} porções
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "700" }}>Ingredientes</Text>

      {recipe.ingredients.map((i) => (
        <Text key={i.id}>
          • {i.text}
          {i.optional ? " (opcional)" : ""}
        </Text>
      ))}

      <Button
        label={ids.includes(recipe.id) ? "Remover dos favoritos" : "Favoritar"}
        variant="outline"
        onPress={() => toggle(recipe.id)}
      />

      <Button
        label="Cozinhar"
        onPress={() => router.push(`/cozinha/${recipe.id}`)}
      />

      <Button
        label={loading ? "Sorteando..." : "Sortear outra"}
        onPress={sortearOutra}
        disabled={loading}
      />
    </ScrollView>
  );
}
