import { Text, type TextProps } from 'react-native';

import { FONT } from '@/lib/fonts';
import { usePalette } from '@/lib/usePalette';

type Tone = 'ink' | 'muted' | 'forest' | 'bronze' | 'paper';

export function AppText({
  className,
  tone = 'ink',
  style,
  ...props
}: TextProps & { className?: string; tone?: Tone }) {
  const theme = usePalette();
  const color = {
    ink: theme.hex.ink,
    muted: theme.hex.muted,
    forest: theme.hex.accent,
    bronze: theme.lockin ? theme.hex.accent : '#C17F4A',
    paper: '#FFF7F0',
  }[tone];
  const family =
    className?.includes('font-semibold') || className?.includes('font-bold')
      ? FONT.semibold
      : className?.includes('font-medium')
        ? FONT.medium
        : FONT.regular;
  return (
    <Text
      {...props}
      className={className}
      style={[{ color, fontFamily: family }, style]}
    />
  );
}

export function Title({ className, style, ...props }: TextProps & { className?: string }) {
  const theme = usePalette();
  return (
    <Text
      {...props}
      className={`text-3xl tracking-tight ${className ?? ''}`}
      style={[{ color: theme.hex.ink, fontFamily: FONT.bold }, style]}
    />
  );
}

export function HelpText({ children }: { children: string }) {
  const theme = usePalette();
  return (
    <Text
      className="mt-1.5 text-[13px] leading-5"
      style={{ color: theme.hex.muted, fontFamily: FONT.regular }}>
      {children}
    </Text>
  );
}
