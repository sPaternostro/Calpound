import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { activitiesFor, estimateActivityCalories } from '@/lib/activities';
import { capExerciseCredit, EXERCISE_CREDIT_CAP_RATIO } from '@/lib/calculations';
import { selectTodayLog, useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

export default function ActivityScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const log = useAppStore(useShallow(selectTodayLog));
  const addExercise = useAppStore((s) => s.addExercise);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);

  if (!profile || !log) return null;

  const options = activitiesFor(profile.activityPreference);
  const selected = options.find((item) => item.id === activityId) ?? options[0];
  const estimate = estimateActivityCalories(selected.met, profile.weightKg, minutes);
  const remainingCap =
    capExerciseCredit(log.exerciseCredit + estimate, profile.dailyGoal) - log.exerciseCredit;
  const creditToday = Math.max(0, remainingCap);
  const cap = Math.round(profile.dailyGoal * EXERCISE_CREDIT_CAP_RATIO);

  const hint = useMemo(
    () =>
      profile.activityPreference === 'low_impact'
        ? 'Lista filtrada por tu preferencia de bajo impacto. Podés cambiarla en Ajustes cuando quieras.'
        : 'Lista filtrada por tu preferencia de actividades más intensas. Se cambia en Ajustes, no según tu peso.',
    [profile.activityPreference],
  );

  return (
    <Screen safeTop={false}>
      <Title className="text-2xl">Sumar movimiento</Title>
      <HelpText>{hint}</HelpText>
      <AppText tone="muted" className="mt-2 text-sm">
        Crédito ya usado hoy: {Math.round(log.exerciseCredit)} / {cap} kcal (tope del 30% del
        presupuesto).
      </AppText>

      <View className="mt-4">
        {options.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setActivityId(item.id)}
            className={`mb-2 rounded-2xl border px-4 py-3 ${
              selected.id === item.id ? 'border-forest bg-sage' : 'border-line bg-paper'
            }`}>
            <AppText className="font-semibold">{item.name}</AppText>
            <AppText tone="muted" className="text-sm">
              {item.hint}
            </AppText>
          </Pressable>
        ))}
      </View>

      <AppText className="mt-2 text-sm font-medium">Duración: {minutes} min</AppText>
      <Slider
        minimumValue={10}
        maximumValue={120}
        step={5}
        value={minutes}
        minimumTrackTintColor="#2F5D50"
        thumbTintColor="#C17F4A"
        onValueChange={setMinutes}
      />
      <HelpText>
        La duración es aproximada. El crédito se estima con MET × tu peso × tiempo, y después se recorta
        si el día ya alcanzó el tope.
      </HelpText>

      <Card className="mt-4">
        <AppText tone="muted">Crédito que se va a sumar</AppText>
        <AppText className="text-2xl font-semibold text-forest">{creditToday} kcal</AppText>
        {creditToday < estimate ? (
          <HelpText>
            La estimación era {estimate} kcal; el tope diario deja {creditToday} de crédito para hoy.
          </HelpText>
        ) : null}
      </Card>

      <View className="mt-6">
        <Button
          label="Registrar actividad"
          onPress={() => {
            addExercise({
              type: selected.name,
              durationMinutes: minutes,
              caloriesCredit: estimate,
            });
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}
