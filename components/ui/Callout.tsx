import type { ReactNode } from 'react';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { usePalette } from '@/lib/usePalette';

import { AppText } from './AppText';

export function Callout({ children, className }: { children: ReactNode; className?: string }) {
  const theme = usePalette();
  return (
    <View className={`flex-row items-start rounded-2xl px-3.5 py-3 ${theme.lockin ? 'bg-emberCard' : 'bg-sage'} ${className ?? ''}`}>
      <Ionicons
        name="information-circle-outline"
        size={18}
        color={theme.hex.muted}
        style={{ marginTop: 1 }}
      />
      <View className="ml-2.5 flex-1">{children}</View>
    </View>
  );
}

export function CalloutText({ children }: { children: ReactNode }) {
  return (
    <AppText tone="muted" className="text-[13px] leading-5">
      {children}
    </AppText>
  );
}
