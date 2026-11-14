import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="receita/[id]" options={{ title: 'Receita' }} />
      <Stack.Screen name="cozinha/[id]" options={{ title: 'Modo cozinha' }} />
    </Stack>
  );
}
