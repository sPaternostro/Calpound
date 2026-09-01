import { View } from 'react-native';

import type { GoalType } from '@/lib/types';

import { AppText } from './AppText';

export function BudgetBar({
  consumed,
  dailyGoal,
  healthyRangeMin,
  healthyRangeMax,
  exerciseCredit,
  goalType,
}: {
  consumed: number;
  dailyGoal: number;
  healthyRangeMin: number;
  healthyRangeMax: number;
  exerciseCredit: number;
  goalType: GoalType;
}) {
  const ceiling = goalType === 'gain' ? healthyRangeMax : dailyGoal + exerciseCredit;
  const floor = goalType === 'gain' ? dailyGoal : healthyRangeMin;
  const span = Math.max(1, ceiling);
  const usedPct = Math.min(100, (consumed / span) * 100);
  const goalPct = Math.min(100, (dailyGoal / span) * 100);
  const floorPct = Math.min(100, (floor / span) * 100);

  const inRange =
    goalType === 'gain'
      ? consumed >= dailyGoal && consumed <= healthyRangeMax
      : consumed >= healthyRangeMin && consumed <= dailyGoal + exerciseCredit;

  return (
    <View>
      <View className="h-3 overflow-hidden rounded-full bg-sage">
        <View
          className={`h-full rounded-full ${inRange ? 'bg-forest' : 'bg-bronze'}`}
          style={{ width: `${usedPct}%` }}
        />
      </View>
      <View className="relative mt-1 h-4">
        <View className="absolute top-0 h-3 w-0.5 bg-muted" style={{ left: `${floorPct}%` }} />
        <View className="absolute top-0 h-3 w-0.5 bg-forest" style={{ left: `${goalPct}%` }} />
      </View>
      <AppText tone="muted" className="text-xs">
        {goalType === 'gain'
          ? `Piso del día ${Math.round(dailyGoal)} · tope seguro ${Math.round(healthyRangeMax)}`
          : `Piso seguro ${Math.round(healthyRangeMin)} · presupuesto ${Math.round(dailyGoal)}${exerciseCredit ? ` + ${Math.round(exerciseCredit)} de movimiento` : ''}`}
      </AppText>
    </View>
  );
}
