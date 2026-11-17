import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CATEGORIES,
  categoryInfo,
  DIFFICULTY_LABEL,
} from "../../features/recipes/categories";
import { filterRecipes } from "../../features/recipes/search";
import { dataSource, loadRecipes } from "../../features/recipes/service";
import { Recipe, RecipeCategory } from "../../types";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";
import { colors, radius, space } from "../../ui/theme";

export default function Explorar() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [category, setCategory] = useState<RecipeCategory | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async (force = false) => {
    setRecipes(await loadRecipes(force));
    setOffline(dataSource() === "local");
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const visible = useMemo(
    () => filterRecipes(recipes, { category, query }),
    [recipes, category, query],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: space.md, gap: space.sm }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar receita ou ingrediente"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={{
            marginHorizontal: 20,
            height: 48,
            paddingHorizontal: space.md,
            borderRadius: radius.chip,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.card,
            fontSize: 16,
            color: colors.ink,
          }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, gap: space.sm }}
        >
          <Chip
            label="Todas"
            selected={category === null}
            onPress={() => setCategory(null)}
          />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji} ${c.label}`}
              selected={category === c.id}
              onPress={() => setCategory(category === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: colors.muted }}>
            {visible.length} {visible.length === 1 ? "receita" : "receitas"}
          </Text>
          {offline && (
            <Text style={{ color: colors.orange, fontWeight: "700" }}>
              Modo offline
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 20, gap: space.sm, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
          />
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => router.push(`/receita/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: space.md,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}
            >
              Nenhuma receita encontrada
            </Text>
            <Button
              label="Limpar filtros"
              variant="outline"
              onPress={() => {
                setQuery("");
                setCategory(null);
              }}
            />
          </View>
        }
      />
    </View>
  );
}

function RecipeCard({
  recipe,
  onPress,
}: {
  recipe: Recipe;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: 12,
        borderRadius: radius.card,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <Text style={{ fontSize: 28 }}>
          {categoryInfo(recipe.category).emoji}
        </Text>
      </View>
      <View style={{ flex: 1, gap: space.xs }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}
        >
          {recipe.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {recipe.prepTimeMinutes} min · {DIFFICULTY_LABEL[recipe.difficulty]} ·{" "}
          {recipe.servings} {recipe.servings === 1 ? "porção" : "porções"}
        </Text>
      </View>
    </Pressable>
  );
}
