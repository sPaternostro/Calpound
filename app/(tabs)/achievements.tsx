import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { todayKey } from '@/lib/dates';
import { FONT } from '@/lib/fonts';
import { achievementRoadmap, computeLevel, nearestAchievement } from '@/lib/levels';
import { useAppStore } from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';
import { usePalette } from '@/lib/usePalette';

export default function AchievementsScreen() {
  const router = useRouter();
  const achievements = useAppStore((s) => s.achievements);
  const logs = useAppStore((s) => s.dailyLogs);
  const profile = useAppStore((s) => s.profile);
  const savings = useAppStore((s) => s.savings);
  const effortPoints = useAppStore((s) => s.effortPoints);
  const enjoymentPoints = useAppStore((s) => s.enjoymentPoints);
  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const theme = usePalette();
  const lockin = profile?.mode === 'tryhard';
  const level = computeLevel(effortPoints, enjoymentPoints);
  const next = nearestAchievement({ achievements, dailyLogs: logs, savings });
  const today = logs[todayKey()];
  const inRange = !!today?.isValidDay;
  const effortPct = Math.min(100, (effortPoints / Math.max(effortPoints, enjoymentPoints, 50)) * 100);
  const enjoymentPct = Math.min(
    100,
    (enjoymentPoints / Math.max(effortPoints, enjoymentPoints, 50)) * 100,
  );
  const levelPct = (level.intoLevel / level.pointsPerLevel) * 100;
  return (
    <Screen header={<AppHeader />}>
      <Card className="mb-4 p-5">
        <AppText tone="muted" className="text-xs uppercase tracking-wide">
          Para mañana
        </AppText>
        <AppText className="mt-1 text-xl font-semibold">
          {inRange
            ? `Mañana arrancás con ${streak} día${streak === 1 ? '' : 's'} de racha`
            : `Cerrá hoy en rango y mañana la racha pasa a ${streak + 1}`}
        </AppText>
        <AppText className="mt-3 text-3xl font-semibold">{streak} días ahora</AppText>
        {lockin ? (
          <AppText tone="bronze" className="mt-1 text-sm font-medium">
            Mejor histórica: {historic} días
          </AppText>
        ) : null}
        {!inRange ? (
          <View className="mt-4">
            <Button label="Registrar comida de hoy" onPress={() => router.push('/food')} />
          </View>
        ) : null}
      </Card>

      <Card className={`p-5 ${theme.budget}`}>
        <AppText tone="muted" className="text-xs uppercase tracking-wide">
          Tu nivel
        </AppText>
        <AppText className="mt-1 text-3xl font-semibold">
          Nivel {level.level}: {level.name}
        </AppText>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
          <View className="h-full rounded-full bg-forest" style={{ width: `${levelPct}%` }} />
        </View>
        <AppText tone="muted" className="mt-2 text-xs">
          {level.intoLevel} / {level.pointsPerLevel} · te falta {level.bottleneck}
        </AppText>
        <View className="mt-4">
          <AppText className="text-xs font-medium">Constancia</AppText>
          <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
            <View className="h-full rounded-full bg-forest" style={{ width: `${effortPct}%` }} />
          </View>
          <AppText className="mt-3 text-xs font-medium">Disfrute</AppText>
          <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
            <View className="h-full rounded-full bg-bronze" style={{ width: `${enjoymentPct}%` }} />
          </View>
        </View>
      </Card>

      {next ? (
        <Card className="mt-4">
          <AppText tone="muted" className="text-xs uppercase tracking-wide">
            Próxima recompensa
          </AppText>
          <AppText className="mt-1 font-semibold">{next.title}</AppText>
          <AppText tone="muted" className="mt-1 text-sm">
            {next.hint}
          </AppText>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage">
            <View className="h-full rounded-full bg-bronze" style={{ width: `${next.ratio * 100}%` }} />
          </View>
        </Card>
      ) : null}

      <View className="mb-3 mt-5 flex-row items-center justify-between">
        <AppText style={{ fontFamily: FONT.semibold }}>Colección</AppText>
        <AppText tone="muted" style={{ fontFamily: FONT.semibold }}>
          {achievements.filter((item) => item.unlockedAt).length}/{achievements.length}
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
        {achievements.map((item) => {
          const unlocked = !!item.unlockedAt;
          return (
            <View
              key={item.id}
              className="mr-3 w-52 rounded-3xl border-2 p-4"
              style={{
                backgroundColor: unlocked
                  ? lockin
                    ? '#4A2818'
                    : '#D7E4DE'
                  : theme.hex.screen,
                borderColor: unlocked ? theme.hex.accent : theme.hex.line,
                opacity: unlocked ? 1 : 0.72,
              }}>
              {unlocked ? (
                <Ionicons name="checkmark-circle" size={28} color={theme.hex.accent} />
              ) : (
                <Ionicons name="lock-closed-outline" size={22} color={theme.hex.muted} />
              )}
              <AppText className="mt-2" style={{ fontFamily: FONT.semibold }}>
                {unlocked ? item.title : 'Logro oculto'}
              </AppText>
              <AppText tone="muted" className="mt-1 text-xs leading-4">
                {unlocked ? item.description : 'Se revela cuando lo desbloqueás.'}
              </AppText>
              <AppText className="mt-2 text-xs" style={{ color: theme.hex.accent, fontFamily: FONT.medium }}>
                {achievementRoadmap(item, logs, savings)}
              </AppText>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
