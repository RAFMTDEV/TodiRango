import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  Text,
  Vibration,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { INGREDIENTS } from "../../features/pantry/ingredients";
import { usePantry } from "../../features/pantry/store";
import { useRecipeHistory } from "../../features/recipes/history";
import { getRandomRecipe } from "../../features/recipes/service";
import { useShake } from "../../features/shake/useShake";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";
import { colors } from "../../ui/theme";

export default function Despensa() {
  const router = useRouter();
  const { selected, toggle } = usePantry();

  const [sorteando, setSorteando] = useState(false);

  const { recentIds, add, clear } = useRecipeHistory();

  const sorteioEmAndamento = useRef(false);

  // Valor utilizado para animar o prato
  const animacao = useRef(new Animated.Value(0)).current;

  const animacaoLoop = useRef<Animated.CompositeAnimation | null>(null);

  const iniciarAnimacao = () => {
    animacao.setValue(0);

    animacaoLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(animacao, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animacao, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    animacaoLoop.current.start();
  };

  const pararAnimacao = () => {
    animacaoLoop.current?.stop();
    animacao.setValue(0);
  };

  const sortear = async () => {
    if (sorteioEmAndamento.current) return;

    if (selected.length === 0) {
      Alert.alert(
        "Despensa vazia",
        "Selecione pelo menos um ingrediente antes de sortear.",
      );
      return;
    }

    sorteioEmAndamento.current = true;
    setSorteando(true);

    const inicio = Date.now();

    iniciarAnimacao();
    Vibration.vibrate(300);

    try {
      let recipe = await getRandomRecipe(selected, recentIds);

      if (!recipe && recentIds.length > 0) {
        clear();
        recipe = await getRandomRecipe(selected);

        if (recipe) {
          Alert.alert(
            "Novas opções!",
            "Você já viu todas as receitas disponíveis. Vamos começar uma nova rodada!",
          );
        }
      }

      // Garante que a animação fique visível por pelo menos 1,4 segundo
      const tempoRestante = Math.max(0, 1400 - (Date.now() - inicio));

      await new Promise<void>((resolve) => setTimeout(resolve, tempoRestante));

      if (!recipe) {
        Alert.alert(
          "Nenhuma receita encontrada",
          "Não encontramos receitas com os ingredientes selecionados. Tente marcar outros ingredientes.",
        );
        return;
      }

      add(recipe.id);

      router.push(`/receita/${recipe.id}`);
    } catch (error) {
      Alert.alert(
        "Erro ao sortear",
        "Não foi possível buscar uma receita. Tente novamente.",
      );
    } finally {
      pararAnimacao();
      sorteioEmAndamento.current = false;
      setSorteando(false);
    }
  };

  useShake(sortear);

  const categories = [...new Set(INGREDIENTS.map((i) => i.category))];

  // Movimento de giro do prato
  const rotacao = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.ink,
          }}
        >
          O que tem na geladeira?
        </Text>

        {categories.map((cat) => (
          <View key={cat} style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 15,
                color: colors.muted,
                marginBottom: 8,
              }}
            >
              {cat}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {INGREDIENTS.filter((i) => i.category === cat).map((i) => (
                <Chip
                  key={i.id}
                  label={i.name}
                  selected={selected.includes(i.name)}
                  onPress={() => toggle(i.name)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: 20 }}>
        <Button
          label={
            sorteando ? "Sorteando..." : `Sortear receita (${selected.length})`
          }
          onPress={sortear}
          disabled={sorteando}
        />

        <Text
          style={{
            textAlign: "center",
            marginTop: 8,
            color: colors.muted,
          }}
        >
          ou chacoalhe o celular
        </Text>
      </View>

      {/* Tela de animação do sorteio */}
      {sorteando && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bg,
              padding: 35,
              borderRadius: 24,
              alignItems: "center",
              width: "82%",
            }}
          >
            <Animated.Text
              style={{
                fontSize: 75,
                transform: [{ rotate: rotacao }],
              }}
            >
              🍽️
            </Animated.Text>

            <Text
              style={{
                fontSize: 21,
                fontWeight: "800",
                color: colors.ink,
                marginTop: 20,
                textAlign: "center",
              }}
            >
              Preparando sua receita...
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              Misturando seus ingredientes!
            </Text>

            <Text style={{ fontSize: 25, marginTop: 15 }}>🥕 🧀 🍅</Text>
          </View>
        </View>
      )}
    </View>
  );
}
