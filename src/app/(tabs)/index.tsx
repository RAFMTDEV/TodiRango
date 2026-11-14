import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { INGREDIENTS } from '../../features/pantry/ingredients';
import { usePantry } from '../../features/pantry/store';
import { getRandomRecipe } from '../../features/recipes/service';
import { useShake } from '../../features/shake/useShake';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { colors } from '../../ui/theme';

export default function Despensa() {
  const router = useRouter();
  const { selected, toggle } = usePantry();

  const sortear = async () => {
    const recipe = await getRandomRecipe(selected);
    if (!recipe) return Alert.alert('Nenhuma receita', 'Marque mais ingredientes e tente de novo.');
    router.push(`/receita/${recipe.id}`);
  };
  useShake(sortear);

  const categories = [...new Set(INGREDIENTS.map((i) => i.category))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.ink }}>O que tem na geladeira?</Text>
        {categories.map((cat) => (
          <View key={cat} style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 15, color: colors.muted, marginBottom: 8 }}>{cat}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {INGREDIENTS.filter((i) => i.category === cat).map((i) => (
                <Chip key={i.id} label={i.name} selected={selected.includes(i.name)} onPress={() => toggle(i.name)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ padding: 20 }}>
        <Button label={`Sortear receita (${selected.length})`} onPress={sortear} />
        <Text style={{ textAlign: 'center', marginTop: 8, color: colors.muted }}>ou chacoalhe o celular</Text>
      </View>
    </View>
  );
}
