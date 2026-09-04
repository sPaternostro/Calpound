import { View } from 'react-native';

import type { GoalType } from '@/lib/types';
import { usePalette } from '@/lib/usePalette';

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
  const theme = usePalette();
  const ceiling = goalType === 'gain' ? healthyRangeMax : Math.max(dailyGoal + exerciseCredit, 1);
  const usedPct = Math.min(100, (consumed / ceiling) * 100);
  const remainingPct = Math.max(0, 100 - usedPct);

  const inRange =
    goalType === 'gain'
      ? consumed >= dailyGoal && consumed <= healthyRangeMax
      : consumed >= healthyRangeMin && consumed <= dailyGoal + exerciseCredit;

  return (
    <View>
      <View
        className="h-3.5 overflow-hidden rounded-full"
        style={{
          backgroundColor: theme.lockin ? '#3A2418' : '#E7E1D6',
          borderWidth: 1,
          borderColor: theme.hex.line,
        }}>
        <View
          className="h-full rounded-full"
          style={{
            width: `${usedPct}%`,
            backgroundColor: inRange ? theme.hex.accent : theme.hex.flame,
          }}
        />
      </View>
      <AppText tone="muted" className="mt-2 text-xs">
        {goalType === 'gain'
          ? `Piso ${Math.round(dailyGoal)} · tope ${Math.round(healthyRangeMax)}`
          : `Usado ${Math.round(usedPct)}% · queda ${Math.round(remainingPct)}% del presupuesto`}
      </AppText>
    </View>
  );
}
