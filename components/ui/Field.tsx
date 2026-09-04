import { TextInput, View, type TextInputProps } from 'react-native';

import { FONT } from '@/lib/fonts';
import { usePalette } from '@/lib/usePalette';

import { AppText, HelpText } from './AppText';

export function Field({
  label,
  help,
  style,
  ...props
}: TextInputProps & { label: string; help?: string }) {
  const theme = usePalette();
  return (
    <View className="mb-4">
      <AppText className="mb-1.5 text-sm" style={{ fontFamily: FONT.medium }}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={theme.hex.muted}
        className="rounded-2xl border px-4 py-3 text-base"
        style={[
          {
            color: theme.hex.ink,
            backgroundColor: theme.hex.card,
            borderColor: theme.hex.line,
            fontFamily: FONT.regular,
          },
          style,
        ]}
        {...props}
      />
      {help ? <HelpText>{help}</HelpText> : null}
    </View>
  );
}
