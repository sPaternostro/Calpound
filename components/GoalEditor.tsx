import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { HelpText, AppText } from '@/components/ui/AppText';
import { ChoiceChip } from '@/components/ui/Button';
import { GOAL_OPTIONS } from '@/lib/copy';
import {
  clampDailyGoal,
  dailyGoalBounds,
  suggestedDailyGoal,
} from '@/lib/calculations';
import type { GoalType } from '@/lib/types';

const STEP_KCAL = 50;

export function GoalEditor({
  goalType,
  tdee,
  healthyRangeMin,
  healthyRangeMax,
  dailyGoal,
  onChange,
}: {
  goalType: GoalType;
  tdee: number;
  healthyRangeMin: number;
  healthyRangeMax: number;
  dailyGoal: number;
  onChange: (next: { goalType: GoalType; dailyGoal: number }) => void;
}) {
  const bounds = dailyGoalBounds(goalType, tdee, healthyRangeMin, healthyRangeMax);
  const clamped = clampDailyGoal(dailyGoal, bounds.min, bounds.max);
  const [localGoal, setLocalGoal] = useState(clamped);

  useEffect(() => {
    setLocalGoal(clamped);
  }, [clamped, goalType, tdee]);

  const setGoal = (nextType: GoalType) => {
    const nextBounds = dailyGoalBounds(nextType, tdee, healthyRangeMin, healthyRangeMax);
    onChange({
      goalType: nextType,
      dailyGoal:
        suggestedDailyGoal(nextType, tdee, healthyRangeMin, healthyRangeMax) ||
        clampDailyGoal(dailyGoal, nextBounds.min, nextBounds.max),
    });
  };

  const applyDelta = (delta: number) => {
    const next = clampDailyGoal(localGoal + delta, bounds.min, bounds.max);
    setLocalGoal(next);
    onChange({ goalType, dailyGoal: next });
  };

  const span = Math.max(1, bounds.max - bounds.min);
  const progressPct = Math.min(100, Math.max(0, ((localGoal - bounds.min) / span) * 100));
  const atMin = localGoal <= bounds.min;
  const atMax = localGoal >= bounds.max;

  return (
    <View>
      <AppText className="mb-2 text-sm font-medium">¿Cuál es tu meta?</AppText>
      <View className="flex-row flex-wrap">
        {GOAL_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={goalType === option.value}
            onPress={() => setGoal(option.value)}
          />
        ))}
      </View>
      <HelpText>
        {GOAL_OPTIONS.find((item) => item.value === goalType)?.help ?? ''}
      </HelpText>

      <AppText className="mb-1 mt-5 text-sm font-medium">Presupuesto diario</AppText>
      <View className="mt-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => applyDelta(-STEP_KCAL)}
          disabled={atMin}
          className={`min-w-[72px] items-center justify-center rounded-2xl border border-line bg-paper px-3 py-3 ${atMin ? 'opacity-40' : 'active:opacity-80'}`}>
          <AppText className="text-sm font-semibold">−50</AppText>
        </Pressable>
        <AppText className="text-2xl font-semibold text-forest">{localGoal} kcal</AppText>
        <Pressable
          onPress={() => applyDelta(STEP_KCAL)}
          disabled={atMax}
          className={`min-w-[72px] items-center justify-center rounded-2xl border border-line bg-paper px-3 py-3 ${atMax ? 'opacity-40' : 'active:opacity-80'}`}>
          <AppText className="text-sm font-semibold">+50</AppText>
        </Pressable>
      </View>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage">
        <View className="h-full rounded-full bg-forest" style={{ width: `${progressPct}%` }} />
      </View>
      <AppText tone="muted" className="mt-1 text-xs">
        {bounds.min} — {bounds.max} kcal
      </AppText>
      <HelpText>
        {goalType === 'gain'
          ? `Para subir, el presupuesto vive entre tu gasto (${tdee}) y el tope seguro (${healthyRangeMax}). La app no deja salir de ese tramo.`
          : `Para ${goalType === 'lose' ? 'bajar' : 'mantener'}, el presupuesto vive entre el piso seguro (${healthyRangeMin}) y tu gasto (${tdee}). Así no recortás de más.`}
      </HelpText>
    </View>
  );
}
