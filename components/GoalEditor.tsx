import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { HelpText, AppText } from '@/components/ui/AppText';
import { ChoiceChip } from '@/components/ui/Button';
import { GOAL_OPTIONS } from '@/lib/copy';
import {
  clampDailyGoal,
  dailyGoalBounds,
  suggestedDailyGoal,
} from '@/lib/calculations';
import type { GoalType } from '@/lib/types';

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
      dailyGoal: suggestedDailyGoal(nextType, tdee, healthyRangeMin, healthyRangeMax) ||
        clampDailyGoal(dailyGoal, nextBounds.min, nextBounds.max),
    });
  };

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
      <AppText className="text-2xl font-semibold text-forest">{localGoal} kcal</AppText>
      <Slider
        minimumValue={bounds.min}
        maximumValue={Math.max(bounds.min, bounds.max)}
        step={10}
        value={localGoal}
        minimumTrackTintColor="#2F5D50"
        maximumTrackTintColor="#D7E4DE"
        thumbTintColor="#C17F4A"
        onValueChange={(value) => setLocalGoal(clampDailyGoal(value, bounds.min, bounds.max))}
        onSlidingComplete={(value) =>
          onChange({ goalType, dailyGoal: clampDailyGoal(value, bounds.min, bounds.max) })
        }
      />
      <HelpText>
        {goalType === 'gain'
          ? `Para subir, el presupuesto vive entre tu gasto (${tdee}) y el tope seguro (${healthyRangeMax}). La app no deja salir de ese tramo.`
          : `Para ${goalType === 'lose' ? 'bajar' : 'mantener'}, el presupuesto vive entre el piso seguro (${healthyRangeMin}) y tu gasto (${tdee}). Así no recortás de más.`}
      </HelpText>
    </View>
  );
}
