import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import type { DailyMission } from '@/lib/missions';
import { usePalette } from '@/lib/usePalette';

import { AppText } from './AppText';
import { Button } from './Button';

const ICONS = {
  leaf: 'leaf-outline',
  walk: 'walk-outline',
  restaurant: 'restaurant-outline',
  flame: 'flame-outline',
} as const;

export function MissionCard({
  mission,
  done,
  onPress,
}: {
  mission: DailyMission;
  done: boolean;
  onPress: () => void;
}) {
  const theme = usePalette();
  return (
    <View
      className="rounded-3xl border-2 p-5"
      style={{
        backgroundColor: done
          ? theme.lockin
            ? '#3A2418'
            : theme.hex.card
          : theme.lockin
            ? theme.hex.card
            : '#D7E4DE',
        borderColor: done ? theme.hex.accent : theme.lockin ? theme.hex.flame : theme.hex.accent,
      }}>
      <View className="flex-row items-center justify-between">
        <AppText tone="muted" className="text-xs font-semibold uppercase tracking-wide">
          Misión de hoy
        </AppText>
        <View
          className={`rounded-full px-3 py-1 ${done ? (theme.lockin ? 'bg-flame' : 'bg-forest') : theme.lockin ? 'bg-ember' : 'bg-paper'}`}>
          <AppText
            className="text-xs font-semibold"
            tone={done ? 'paper' : 'muted'}>
            {done ? 'Completa' : 'Pendiente'}
          </AppText>
        </View>
      </View>
      <View className="mt-3 flex-row items-start">
        <View
          className={`mr-3 h-11 w-11 items-center justify-center rounded-2xl ${
            done ? (theme.lockin ? 'bg-flame' : 'bg-forest') : theme.lockin ? 'bg-ember' : 'bg-paper'
          }`}>
          <Ionicons
            name={done ? 'checkmark' : ICONS[mission.icon]}
            size={22}
            color={done ? '#FFFcf7' : theme.hex.accent}
          />
        </View>
        <View className="flex-1">
          <AppText className={`text-xl font-semibold ${done ? 'line-through opacity-80' : ''}`}>
            {mission.title}
          </AppText>
          <AppText tone="muted" className="mt-1 text-sm leading-5">
            {done ? 'Listo. Mañana hay otra.' : mission.detail}
          </AppText>
        </View>
      </View>
      {!done ? (
        <View className="mt-4">
          <Button label={mission.cta} onPress={onPress} />
        </View>
      ) : null}
    </View>
  );
}
