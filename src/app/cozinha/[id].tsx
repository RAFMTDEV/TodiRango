import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecipeById } from '../../features/recipes/service';
import { Recipe } from '../../types';
import { Button } from '../../ui/Button';
import { colors } from '../../ui/theme';

// TODO (tarefa 4): cronômetro com useTimer, expo-keep-awake, animações
export default function Cozinha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => { getRecipeById(id).then(setRecipe); }, [id]);
  if (!recipe) return null;

  const current = recipe.steps[step];
  const isLast = step === recipe.steps.length - 1;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.dark,
        padding: 24,
        paddingBottom: 24 + insets.bottom,
        gap: 16,
      }}>
      <Text style={{ color: colors.orange, fontWeight: '700' }}>
        Passo {step + 1} de {recipe.steps.length}
      </Text>
      <Text style={{ color: colors.bg, fontSize: 26, fontWeight: '800' }}>{current.text}</Text>
      <View style={{ flex: 1 }} />
      <Button
        label={isLast ? 'Concluir' : 'Próximo passo'}
        onPress={() => (isLast ? router.back() : setStep(step + 1))}
      />
    </View>
  );
}