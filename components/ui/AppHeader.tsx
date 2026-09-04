import { View } from 'react-native';

import { FONT } from '@/lib/fonts';
import { usePalette } from '@/lib/usePalette';

import { ModeBadge } from './ModeBadge';
import { Title } from './AppText';

export function AppHeader() {
  const theme = usePalette();
  return (
    <View
      className="flex-row items-center justify-between px-5"
      style={{
        backgroundColor: theme.hex.header,
        borderBottomWidth: 1,
        borderBottomColor: theme.hex.line,
        paddingTop: 18,
        paddingBottom: 16,
      }}>
      <Title
        className="text-[30px]"
        style={{
          color: theme.lockin ? theme.hex.accent : theme.hex.ink,
          fontFamily: FONT.bold,
          letterSpacing: -0.6,
          lineHeight: 38,
          paddingTop: 2,
        }}>
        Calpound
      </Title>
      <ModeBadge />
    </View>
  );
}
