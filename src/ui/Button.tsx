import { Pressable, Text } from 'react-native';
import { colors, radius } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{
        height: 56,
        borderRadius: radius.button,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? colors.orange : colors.card,
        borderWidth: primary ? 0 : 2,
        borderColor: colors.green,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '800',
          color: primary ? colors.ink : colors.green,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
