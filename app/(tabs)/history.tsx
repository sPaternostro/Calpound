import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { addDays, formatDayLabel, formatKcal, startOfWeek, todayKey, weekKeys } from '@/lib/dates';
import { useAppStore } from '@/lib/store';
import { usePalette } from '@/lib/usePalette';

export default function HistoryScreen() {
  const router = useRouter();
  const logs = useAppStore((s) => s.dailyLogs);
  const foods = useAppStore((s) => s.foodEntries);
  const exercises = useAppStore((s) => s.exerciseEntries);
  const [anchor, setAnchor] = useState(todayKey());
  const [selected, setSelected] = useState(todayKey());
  const keys = weekKeys(anchor);
  const theme = usePalette();

  useEffect(() => {
    const week = weekKeys(anchor);
    if (!week.includes(selected)) {
      setSelected(week.includes(todayKey()) ? todayKey() : week[0]!);
    }
  }, [anchor, selected]);

  const log = logs[selected];
  const dayFoods = foods.filter((item) => item.date === selected);
  const dayMoves = exercises.filter((item) => item.date === selected);
  const validDays = keys.filter((key) => logs[key]?.isValidDay).length;
  const savedWeek = keys.reduce((sum, key) => sum + (logs[key]?.isValidDay ? logs[key]!.saved : 0), 0);

  return (
    <Screen header={<AppHeader />}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => setAnchor(addDays(startOfWeek(anchor), -7))}
          className={`rounded-full border px-3 py-2 ${theme.card}`}>
          <Ionicons name="chevron-back" size={18} color={theme.hex.accent} />
        </Pressable>
        <Pressable onPress={() => setAnchor(todayKey())}>
          <AppText className="font-semibold">Esta semana</AppText>
        </Pressable>
        <Pressable
          onPress={() => setAnchor(addDays(startOfWeek(anchor), 7))}
          className={`rounded-full border px-3 py-2 ${theme.card}`}>
          <Ionicons name="chevron-forward" size={18} color={theme.hex.accent} />
        </Pressable>
      </View>

      <View className="flex-row">
        {keys.map((key) => {
          const dayLog = logs[key];
          const valid = dayLog?.isValidDay;
          const isSelected = key === selected;
          return (
            <Pressable
              key={key}
              onPress={() => setSelected(key)}
              className="flex-1 items-center px-0.5">
              <AppText tone="muted" className="text-[10px] uppercase">
                {formatDayLabel(key).slice(0, 3)}
              </AppText>
              <View
                className="mt-1 h-14 w-full items-center justify-center rounded-2xl"
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? theme.hex.accent
                    : valid
                      ? theme.hex.accent
                      : theme.hex.line,
                  backgroundColor: valid
                    ? theme.lockin
                      ? theme.hex.flame
                      : theme.hex.accent
                    : theme.hex.card,
                }}>
                <AppText
                  className="text-sm font-semibold"
                  style={{ color: valid ? '#FFF7F0' : theme.hex.ink }}>
                  {Number(key.slice(8))}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-4 flex-row gap-3">
        <Card className="flex-1">
          <AppText tone="muted" className="text-xs">
            Días en rango
          </AppText>
          <AppText className="text-2xl font-semibold">{validDays}/7</AppText>
        </Card>
        <Card className="flex-1">
          <AppText tone="muted" className="text-xs">
            Al banco
          </AppText>
          <AppText className="text-2xl font-semibold text-forest">{formatKcal(savedWeek)}</AppText>
        </Card>
      </View>

      <Card className="mt-4">
        <AppText className="font-semibold">{formatDayLabel(selected)}</AppText>
        {!log ? (
          <AppText tone="muted" className="mt-2">
            Sin registro
          </AppText>
        ) : (
          <>
            <AppText className="mt-2 text-lg font-semibold">
              {formatKcal(log.totalConsumed)}
              {log.isValidDay ? ` · +${log.saved} al banco` : ' · sin saldo'}
            </AppText>
            {dayFoods.length === 0 && dayMoves.length === 0 ? (
              <AppText tone="muted" className="mt-2 text-sm">
                No hay comidas ni movimiento ese día.
              </AppText>
            ) : (
              <View className="mt-3">
                {dayFoods.map((item) => (
                  <View key={item.id} className="mb-1 flex-row justify-between">
                    <AppText className="flex-1 pr-2">{item.name}</AppText>
                    <AppText tone="muted">{item.calories}</AppText>
                  </View>
                ))}
                {dayMoves.map((item) => (
                  <View key={item.id} className="mb-1 flex-row justify-between">
                    <AppText className="flex-1 pr-2">{item.type}</AppText>
                    <AppText tone="forest">+{item.caloriesCredit}</AppText>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        {selected <= todayKey() ? (
          <View className="mt-4 gap-2">
            <Button
              label="Sumar comida a este día"
              onPress={() => router.push({ pathname: '/food', params: { date: selected } })}
            />
            <Button
              label="Sumar movimiento a este día"
              variant="secondary"
              onPress={() => router.push({ pathname: '/activity', params: { date: selected } })}
            />
          </View>
        ) : (
          <AppText tone="muted" className="mt-3 text-sm">
            Ese día todavía no llegó. Los registros se cargan hasta hoy.
          </AppText>
        )}
      </Card>
    </Screen>
  );
}
