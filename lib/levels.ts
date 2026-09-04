import type { Achievement, DailyLog, SavingsBalance } from './types';
import { bestStreak, currentStreak, validDaysInWeek } from './streaks';
import { todayKey } from './dates';

export const EFFORT_PER_VALID_DAY = 10;
export const ENJOYMENT_PER_SPEND = 10;
export const POINTS_PER_LEVEL = 50;

export const LEVEL_NAMES = [
  'Arranque',
  'Ritmo',
  'Equilibrio',
  'Constancia',
  'Soltura',
  'Maestría',
  'Fluidez',
  'Oficio',
];

export function derivePoints(
  dailyLogs: Record<string, DailyLog>,
  savings: SavingsBalance,
): { effortPoints: number; enjoymentPoints: number } {
  const effortPoints =
    Object.values(dailyLogs).filter((log) => log.isValidDay).length * EFFORT_PER_VALID_DAY;
  const enjoymentPoints =
    savings.history.filter((item) => item.type === 'spent').length * ENJOYMENT_PER_SPEND;
  return { effortPoints, enjoymentPoints };
}

export function computeLevel(effortPoints: number, enjoymentPoints: number) {
  const balanced = Math.min(effortPoints, enjoymentPoints);
  const level = Math.floor(balanced / POINTS_PER_LEVEL) + 1;
  const intoLevel = balanced % POINTS_PER_LEVEL;
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? 'Oficio';
  const bottleneck = effortPoints <= enjoymentPoints ? 'constancia' : 'disfrute';
  return {
    level,
    name,
    intoLevel,
    pointsPerLevel: POINTS_PER_LEVEL,
    balanced,
    bottleneck,
    effortPoints,
    enjoymentPoints,
  };
}

export function nearestAchievement(params: {
  achievements: Achievement[];
  dailyLogs: Record<string, DailyLog>;
  savings: SavingsBalance;
}): { title: string; hint: string; ratio: number } | null {
  const { achievements, dailyLogs, savings } = params;
  const streak = currentStreak(dailyLogs);
  const historic = bestStreak(dailyLogs);
  const validCount = Object.values(dailyLogs).filter((log) => log.isValidDay).length;
  const weekValid = validDaysInWeek(dailyLogs, todayKey());

  const targets: Record<string, { current: number; goal: number; hint: string }> = {
    first_valid: { current: validCount, goal: 1, hint: 'días en rango' },
    streak_3: { current: streak, goal: 3, hint: 'días de racha' },
    streak_7: { current: streak, goal: 7, hint: 'días de racha' },
    streak_14: { current: streak, goal: 14, hint: 'días de racha' },
    streak_30: { current: streak, goal: 30, hint: 'días de racha' },
    best_streak_7: { current: historic, goal: 7, hint: 'días en tu mejor racha' },
    saved_2k: { current: savings.totalSaved, goal: 2000, hint: 'kcal en el banco' },
    saved_10k: { current: savings.totalSaved, goal: 10000, hint: 'kcal en el banco' },
    week_5: { current: weekValid, goal: 5, hint: 'días válidos esta semana' },
    first_spend: {
      current: savings.history.some((item) => item.type === 'spent') ? 1 : 0,
      goal: 1,
      hint: 'salida registrada',
    },
  };

  const candidates = achievements
    .filter((item) => !item.unlockedAt && targets[item.id])
    .map((item) => {
      const target = targets[item.id];
      const current = Math.min(target.current, target.goal);
      const remaining = Math.max(0, target.goal - target.current);
      return {
        title: item.title,
        hint:
          remaining === 0
            ? item.title
            : `${remaining} ${target.hint} más para “${item.title}”`,
        ratio: target.goal === 0 ? 0 : current / target.goal,
        remaining,
      };
    })
    .sort((a, b) => b.ratio - a.ratio || a.remaining - b.remaining);

  return candidates[0] ?? null;
}

export function achievementRoadmap(
  item: Achievement,
  dailyLogs: Record<string, DailyLog>,
  savings: SavingsBalance,
): string {
  if (item.unlockedAt) {
    const date = new Date(item.unlockedAt).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `Logrado · ${date}`;
  }
  const streak = currentStreak(dailyLogs);
  const historic = bestStreak(dailyLogs);
  const validCount = Object.values(dailyLogs).filter((log) => log.isValidDay).length;
  const weekValid = validDaysInWeek(dailyLogs, todayKey());
  const daysLeft = (current: number, goal: number) => {
    const left = Math.max(0, goal - current);
    if (left === 1) return 'Falta 1 día';
    return `Faltan ${left} días`;
  };

  if (item.id === 'first_valid') return daysLeft(validCount, 1);
  if (item.id === 'streak_3') return daysLeft(streak, 3);
  if (item.id === 'streak_7') return daysLeft(streak, 7);
  if (item.id === 'streak_14') return daysLeft(streak, 14);
  if (item.id === 'streak_30') return daysLeft(streak, 30);
  if (item.id === 'best_streak_7') return daysLeft(historic, 7);
  if (item.id === 'week_5') return daysLeft(weekValid, 5);
  if (item.id === 'saved_2k') {
    const left = Math.max(0, 2000 - savings.totalSaved);
    return left === 0 ? 'Casi' : `Faltan ${Math.round(left)} kcal`;
  }
  if (item.id === 'saved_10k') {
    const left = Math.max(0, 10000 - savings.totalSaved);
    return left === 0 ? 'Casi' : `Faltan ${Math.round(left)} kcal`;
  }
  if (item.id === 'first_spend') return 'Todavía no';
  return 'En camino';
}
