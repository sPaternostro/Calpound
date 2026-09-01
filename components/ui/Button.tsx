import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

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
  const styles = {
    primary: 'bg-forest',
    secondary: 'bg-sage',
    ghost: 'bg-transparent border border-line',
  }[variant];
  const text = {
    primary: 'text-paper',
    secondary: 'text-forest',
    ghost: 'text-ink',
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl px-5 py-3.5 active:opacity-80 ${styles} ${disabled ? 'opacity-40' : ''}`}>
      <Text className={`text-center text-base font-semibold ${text}`}>{label}</Text>
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
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mb-2 rounded-full px-4 py-2 ${selected ? 'bg-forest' : 'bg-paper border border-line'}`}>
      <Text className={`text-sm font-medium ${selected ? 'text-paper' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View className={`rounded-3xl bg-paper p-4 border border-line ${className ?? ''}`}>{children}</View>
  );
}
