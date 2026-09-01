import { Text, type TextProps } from 'react-native';

type Tone = 'ink' | 'muted' | 'forest' | 'bronze' | 'paper';

const tones: Record<Tone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  forest: 'text-forest',
  bronze: 'text-bronze',
  paper: 'text-paper',
};

export function AppText({
  className,
  tone = 'ink',
  ...props
}: TextProps & { className?: string; tone?: Tone }) {
  return <Text className={`${tones[tone]} ${className ?? ''}`} {...props} />;
}

export function Title({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`text-ink text-3xl font-semibold tracking-tight ${className ?? ''}`} {...props} />
  );
}

export function HelpText({ children }: { children: string }) {
  return (
    <Text className="mt-1.5 text-[13px] leading-5 text-muted">{children}</Text>
  );
}
