import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText, HelpText } from './AppText';

export function Field({
  label,
  help,
  ...props
}: TextInputProps & { label: string; help?: string }) {
  return (
    <View className="mb-4">
      <AppText className="mb-1.5 text-sm font-medium">{label}</AppText>
      <TextInput
        placeholderTextColor="#9A9288"
        className="rounded-2xl border border-line bg-paper px-4 py-3 text-base text-ink"
        {...props}
      />
      {help ? <HelpText>{help}</HelpText> : null}
    </View>
  );
}
