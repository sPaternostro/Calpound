import { View } from 'react-native';

import { AppText } from './AppText';

export function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={last ? 'pt-3' : 'border-b border-line py-3'}>
      <AppText tone="muted" className="text-xs uppercase tracking-wide">
        {label}
      </AppText>
      <AppText className="mt-1 text-xl font-semibold leading-6">{value}</AppText>
    </View>
  );
}
