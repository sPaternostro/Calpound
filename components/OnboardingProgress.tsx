import { Fragment } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { usePalette } from '@/lib/usePalette';

const TOTAL_STEPS = 6;

export function OnboardingProgress({ current }: { current: number }) {
  const theme = usePalette();
  return (
    <View
      className="mb-4 overflow-hidden rounded-3xl border px-4 py-4"
      style={{ borderColor: theme.hex.line, backgroundColor: theme.hex.card }}>
      <View className="flex-row items-center overflow-hidden">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const n = index + 1;
          const active = n === current;
          const done = n < current;
          return (
            <Fragment key={n}>
              <View
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{
                  flexShrink: 0,
                  backgroundColor: active
                    ? theme.hex.primary
                    : done
                      ? theme.hex.secondary
                      : theme.hex.screen,
                  borderWidth: active || done ? 0 : 1,
                  borderColor: theme.hex.line,
                }}>
                <AppText
                  className="text-xs"
                  style={{ color: active ? theme.hex.onPrimary : theme.hex.ink }}>
                  {n}
                </AppText>
              </View>
              {n < TOTAL_STEPS ? (
                <View
                  className="mx-1 h-0.5"
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    minWidth: 4,
                    backgroundColor: n < current ? theme.hex.primary : theme.hex.line,
                  }}
                />
              ) : null}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
