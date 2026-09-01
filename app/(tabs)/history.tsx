import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { addDays, formatDayLabel, startOfWeek, todayKey, weekKeys } from '@/lib/dates';
import { useAppStore } from '@/lib/store';

export default function HistoryScreen() {
  const logs = useAppStore((s) => s.dailyLogs);
  const profile = useAppStore((s) => s.profile);
  const [anchor, setAnchor] = useState(todayKey());
  const keys = weekKeys(anchor);
  const monthStart = `${anchor.slice(0, 7)}-01`;
  const monthDays = buildMonth(anchor);

  return (
    <Screen>
      <Title>Historial</Title>
      <HelpText>
        Los días en rango muestran cuánto se sumó al banco. Un día vacío o fuera de rango simplemente
        no mueve el saldo.
      </HelpText>

      <View className="mt-5 flex-row items-center justify-between">
        <Pressable onPress={() => setAnchor(addDays(startOfWeek(anchor), -7))}>
          <AppText tone="forest" className="font-medium">
            Semana anterior
          </AppText>
        </Pressable>
        <Pressable onPress={() => setAnchor(todayKey())}>
          <AppText className="font-medium">Hoy</AppText>
        </Pressable>
        <Pressable onPress={() => setAnchor(addDays(startOfWeek(anchor), 7))}>
          <AppText tone="forest" className="font-medium">
            Semana siguiente
          </AppText>
        </Pressable>
      </View>

      <View className="mt-4 flex-row">
        {keys.map((key) => {
          const log = logs[key];
          const valid = log?.isValidDay;
          return (
            <View key={key} className="flex-1 items-center px-0.5">
              <AppText tone="muted" className="text-[10px] uppercase">
                {formatDayLabel(key).slice(0, 3)}
              </AppText>
              <View
                className={`mt-1 h-14 w-full items-center justify-center rounded-2xl ${
                  valid ? 'bg-forest' : 'bg-paper border border-line'
                }`}>
                <AppText className={valid ? 'text-paper font-semibold' : 'text-muted'} >
                  {valid ? `+${log?.saved}` : '·'}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      <AppText className="mb-2 mt-8 font-semibold">Mes</AppText>
      <AppText tone="muted" className="mb-3 text-xs">
        {monthStart.slice(0, 7)} · piso {profile?.healthyRangeMin} / objetivo {profile?.dailyGoal}
      </AppText>
      <View className="flex-row flex-wrap">
        {monthDays.map((key) => {
          const log = logs[key];
          return (
            <View
              key={key}
              className={`mb-1.5 mr-1.5 h-10 w-10 items-center justify-center rounded-xl ${
                log?.isValidDay ? 'bg-sage' : 'bg-paper border border-line'
              }`}>
              <AppText className="text-xs">{Number(key.slice(8))}</AppText>
            </View>
          );
        })}
      </View>

      <Card className="mt-6">
        {keys.map((key) => {
          const log = logs[key];
          return (
            <View key={key} className="mb-2 flex-row justify-between">
              <AppText>{formatDayLabel(key)}</AppText>
              <AppText tone={log?.isValidDay ? 'forest' : 'muted'}>
                {log
                  ? log.isValidDay
                    ? `${log.totalConsumed} kcal · +${log.saved}`
                    : `${log.totalConsumed} kcal · sin saldo`
                  : 'sin registro'}
              </AppText>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

function buildMonth(anchor: string): string[] {
  const [y, m] = anchor.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return Array.from({ length: last }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${String(y)}-${String(m).padStart(2, '0')}-${d}`;
  });
}
