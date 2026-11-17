import { Tabs } from 'expo-router';
import { colors } from '../../ui/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.green }}>
      <Tabs.Screen name="index" options={{ title: 'Despensa' }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="compras" options={{ title: 'Compras' }} />
    </Tabs>
  );
}
