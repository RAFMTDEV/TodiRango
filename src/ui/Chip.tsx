import { Pressable, Text } from 'react-native';
import { colors, radius } from './theme';

type Props = { label: string; selected: boolean; onPress: () => void };

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: radius.chip,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: selected ? colors.green : colors.border,
        backgroundColor: selected ? colors.green : colors.card,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '600', color: selected ? '#fff' : colors.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
