import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';

const TOTAL_STEPS = 6;

export function OnboardingProgress({ current }: { current: number }) {
  return (
    <View className="mb-6 rounded-3xl border border-line bg-paper px-4 py-5">
      <AppText
        tone="muted"
        className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[2px]">
        Calpound
      </AppText>
      <View className="flex-row items-center">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const n = index + 1;
          const active = n === current;
          const done = n < current;
          return (
            <View key={n} className="flex-row items-center" style={{ flex: n < TOTAL_STEPS ? 1 : 0 }}>
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  active ? 'bg-forest' : done ? 'bg-sage' : 'border border-line bg-cream'
                }`}>
                <AppText
                  className={`text-xs font-semibold ${active ? 'text-paper' : 'text-ink'}`}>
                  {n}
                </AppText>
              </View>
              {n < TOTAL_STEPS ? (
                <View className={`mx-1 h-0.5 flex-1 ${done ? 'bg-forest' : 'bg-line'}`} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
