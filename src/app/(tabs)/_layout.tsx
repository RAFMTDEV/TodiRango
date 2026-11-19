import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { colors } from '../../ui/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcon =
  (active: IconName, inactive: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color as string} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Despensa', tabBarIcon: tabIcon('basket', 'basket-outline') }}
      />
      <Tabs.Screen
        name="explorar"
        options={{ title: 'Receitas', tabBarIcon: tabIcon('book', 'book-outline') }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{ title: 'Favoritos', tabBarIcon: tabIcon('heart', 'heart-outline') }}
      />
      <Tabs.Screen
        name="compras"
        options={{ title: 'Compras', tabBarIcon: tabIcon('cart', 'cart-outline') }}
      />
    </Tabs>
  );
}
