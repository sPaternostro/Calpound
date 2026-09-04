import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { FONT } from '@/lib/fonts';
import { usePalette } from '@/lib/usePalette';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}) {
  const theme = usePalette();
  const backgroundColor = {
    primary: theme.hex.primary,
    secondary: theme.hex.secondary,
    ghost: 'transparent',
  }[variant];
  const color = {
    primary: theme.hex.onPrimary,
    secondary: theme.hex.onSecondary,
    ghost: theme.hex.ink,
  }[variant];
  const borderColor = variant === 'ghost' ? theme.hex.line : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl px-5 py-3.5 active:opacity-80 ${disabled ? 'opacity-40' : ''}`}
      style={{ backgroundColor, borderWidth: 1, borderColor }}>
      <Text
        className="text-center text-base"
        style={{ color, fontFamily: FONT.semibold }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = usePalette();
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 mb-2 rounded-full px-4 py-2"
      style={{
        backgroundColor: selected ? theme.hex.primary : theme.hex.card,
        borderWidth: 1,
        borderColor: selected ? theme.hex.primary : theme.hex.line,
      }}>
      <Text
        className="text-sm"
        style={{
          color: selected ? theme.hex.onPrimary : theme.hex.ink,
          fontFamily: FONT.medium,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  const theme = usePalette();
  return (
    <View
      className={`rounded-3xl border p-4 ${className ?? ''}`}
      style={[{ backgroundColor: theme.hex.card, borderColor: theme.hex.line }, style]}>
      {children}
    </View>
  );
}
