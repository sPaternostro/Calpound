import { View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAppStore } from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';

export default function AchievementsScreen() {
  const achievements = useAppStore((s) => s.achievements);
  const logs = useAppStore((s) => s.dailyLogs);
  const profile = useAppStore((s) => s.profile);
  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const tryhard = profile?.mode === 'tryhard';

  return (
    <Screen>
      <Title>Logros</Title>
      <HelpText>
        Son marcas personales de consistencia. No hay ranking ni comparación con otras personas.
      </HelpText>

      {tryhard ? (
        <Card className="mt-5">
          <AppText tone="muted">Modo Foco</AppText>
          <AppText className="text-2xl font-semibold">{streak} días de racha</AppText>
          <AppText tone="bronze" className="mt-1 font-medium">
            Mejor histórica: {historic} días
          </AppText>
        </Card>
      ) : (
        <Card className="mt-5">
          <AppText className="text-lg font-semibold">Racha actual: {streak} días</AppText>
        </Card>
      )}

      <View className="mt-5 flex-row flex-wrap justify-between">
        {achievements.map((item) => (
          <View
            key={item.id}
            className={`mb-3 w-[48%] rounded-3xl border p-3 ${
              item.unlockedAt ? 'border-forest bg-sage' : 'border-line bg-paper'
            }`}>
            <AppText className="font-semibold">{item.title}</AppText>
            <AppText tone="muted" className="mt-1 text-xs leading-4">
              {item.description}
            </AppText>
            <AppText className="mt-2 text-xs font-medium text-forest">
              {item.unlockedAt ? 'Desbloqueado' : 'En camino'}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}
