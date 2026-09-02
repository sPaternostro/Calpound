import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { computeLevel, nearestAchievement } from '@/lib/levels';
import { useAppStore } from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';

const CATEGORY_STYLE = {
  streak: 'border-bronze bg-[#F7EDE3]',
  consistency: 'border-forest bg-sage',
  milestone: 'border-line bg-paper',
} as const;

export default function AchievementsScreen() {
  const achievements = useAppStore((s) => s.achievements);
  const logs = useAppStore((s) => s.dailyLogs);
  const profile = useAppStore((s) => s.profile);
  const savings = useAppStore((s) => s.savings);
  const effortPoints = useAppStore((s) => s.effortPoints);
  const enjoymentPoints = useAppStore((s) => s.enjoymentPoints);
  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const tryhard = profile?.mode === 'tryhard';
  const level = computeLevel(effortPoints, enjoymentPoints);
  const next = nearestAchievement({ achievements, dailyLogs: logs, savings });
  const effortPct = Math.min(100, (effortPoints / Math.max(effortPoints, enjoymentPoints, 50)) * 100);
  const enjoymentPct = Math.min(
    100,
    (enjoymentPoints / Math.max(effortPoints, enjoymentPoints, 50)) * 100,
  );
  const levelPct = (level.intoLevel / level.pointsPerLevel) * 100;

  return (
    <Screen>
      <Title>Logros</Title>
      <HelpText>
        Son marcas personales de consistencia. No hay ranking ni comparación con otras personas.
      </HelpText>

      <Card className="mt-5 border-forest bg-sage p-5">
        <AppText tone="muted" className="text-xs uppercase tracking-wide">
          Tu nivel personal
        </AppText>
        <AppText className="mt-1 text-3xl font-semibold">
          Nivel {level.level}: {level.name}
        </AppText>
        <AppText tone="muted" className="mt-2 text-sm">
          Sube con el mínimo entre constancia y disfrute. Ahorrar sin gastar no alcanza.
        </AppText>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
          <View className="h-full rounded-full bg-forest" style={{ width: `${levelPct}%` }} />
        </View>
        <AppText tone="muted" className="mt-2 text-xs">
          {level.intoLevel} / {level.pointsPerLevel} hacia el próximo nivel · te falta más{' '}
          {level.bottleneck}
        </AppText>
        <View className="mt-4">
          <AppText className="text-xs font-medium">Constancia</AppText>
          <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
            <View className="h-full rounded-full bg-forest" style={{ width: `${effortPct}%` }} />
          </View>
          <AppText tone="muted" className="mt-1 text-xs">
            {effortPoints} pts · días en rango
          </AppText>
          <AppText className="mt-3 text-xs font-medium">Disfrute</AppText>
          <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
            <View className="h-full rounded-full bg-bronze" style={{ width: `${enjoymentPct}%` }} />
          </View>
          <AppText tone="muted" className="mt-1 text-xs">
            {enjoymentPoints} pts · veces que usaste el banco
          </AppText>
        </View>
      </Card>

      {next ? (
        <Card className="mt-4">
          <AppText tone="muted" className="text-xs uppercase tracking-wide">
            Próximo logro
          </AppText>
          <AppText className="mt-1 font-semibold">{next.hint}</AppText>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage">
            <View className="h-full rounded-full bg-bronze" style={{ width: `${next.ratio * 100}%` }} />
          </View>
        </Card>
      ) : null}

      {tryhard ? (
        <Card className="mt-4">
          <AppText tone="muted">Modo Foco</AppText>
          <AppText className="text-2xl font-semibold">{streak} días de racha</AppText>
          <AppText tone="bronze" className="mt-1 font-medium">
            Mejor histórica: {historic} días
          </AppText>
        </Card>
      ) : (
        <Card className="mt-4">
          <AppText className="text-lg font-semibold">Racha actual: {streak} días</AppText>
        </Card>
      )}

      <View className="mt-5 flex-row flex-wrap justify-between">
        {achievements.map((item) => {
          const unlocked = !!item.unlockedAt;
          const date = item.unlockedAt
            ? new Date(item.unlockedAt).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'short',
              })
            : null;
          return (
            <View
              key={item.id}
              className={`mb-3 w-[48%] rounded-3xl border p-3 ${
                unlocked ? CATEGORY_STYLE[item.type] : 'border-line bg-cream opacity-80'
              }`}>
              {unlocked ? (
                <Ionicons name="checkmark-circle" size={28} color="#2F5D50" />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color="#6F675F" />
              )}
              <AppText className="mt-1 font-semibold">{item.title}</AppText>
              <AppText tone="muted" className="mt-1 text-xs leading-4">
                {item.description}
              </AppText>
              <AppText className="mt-2 text-xs font-medium text-forest">
                {unlocked ? `Listo · ${date}` : 'En camino'}
              </AppText>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
