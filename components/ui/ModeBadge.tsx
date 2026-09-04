import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { FONT } from '@/lib/fonts';
import { MODE_LABELS } from '@/lib/theme';
import { usePalette } from '@/lib/usePalette';
import { useAppStore } from '@/lib/store';

import { AppText } from './AppText';

export function ModeBadge() {
  const mode = useAppStore((s) => s.profile?.mode);
  const theme = usePalette();
  if (!mode) return null;
  const lockin = mode === 'tryhard';
  return (
    <View
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{
        backgroundColor: lockin ? theme.hex.flame : theme.hex.tabPill,
        borderWidth: lockin ? 1 : 0,
        borderColor: '#FFB36A',
      }}>
      <Ionicons
        name={lockin ? 'flame' : 'happy-outline'}
        size={14}
        color={lockin ? '#FFF7F0' : theme.hex.accent}
      />
      <AppText
        className="ml-1 text-[11px]"
        style={{
          color: lockin ? '#FFF7F0' : theme.hex.accent,
          fontFamily: FONT.semibold,
        }}>
        Modo {MODE_LABELS[mode]}
      </AppText>
    </View>
  );
}
