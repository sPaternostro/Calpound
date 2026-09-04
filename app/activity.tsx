import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, HelpText } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Callout, CalloutText } from '@/components/ui/Callout';
import { Screen } from '@/components/ui/Screen';
import { activitiesFor, estimateActivityCalories } from '@/lib/activities';
import { capExerciseCredit, EXERCISE_CREDIT_CAP_RATIO } from '@/lib/calculations';
import { formatDayLabel, todayKey } from '@/lib/dates';
import { useEntryDate } from '@/lib/entryDate';
import { useAppStore } from '@/lib/store';
import { usePalette } from '@/lib/usePalette';

export default function ActivityScreen() {
  const router = useRouter();
  const theme = usePalette();
  const entryDate = useEntryDate();
  const profile = useAppStore((s) => s.profile);
  const addExercise = useAppStore((s) => s.addExercise);
  const usedCredit = useAppStore((s) =>
    s.exerciseEntries
      .filter((item) => item.date === entryDate)
      .reduce((sum, item) => sum + item.caloriesCredit, 0),
  );
  const [activityId, setActivityId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);

  const hint = useMemo(
    () =>
      profile?.activityPreference === 'intense'
        ? 'Lista filtrada por tu preferencia de actividades más intensas. Se cambia en Ajustes, no según tu peso.'
        : 'Lista filtrada por tu preferencia de bajo impacto. Podés cambiarla en Ajustes cuando quieras.',
    [profile?.activityPreference],
  );

  if (!profile) return null;

  const options = activitiesFor(profile.activityPreference);
  const selected = options.find((item) => item.id === activityId) ?? options[0];
  const estimate = estimateActivityCalories(selected.met, profile.weightKg, minutes);
  const remainingCap = capExerciseCredit(usedCredit + estimate, profile.dailyGoal) - usedCredit;
  const creditToday = Math.max(0, remainingCap);
  const cap = Math.round(profile.dailyGoal * EXERCISE_CREDIT_CAP_RATIO);

  return (
    <Screen safeTop={false}>
      {entryDate !== todayKey() ? (
        <AppText className="mb-2 font-semibold">Para el {formatDayLabel(entryDate)}</AppText>
      ) : null}
      <HelpText>{hint}</HelpText>
      <Callout className="mt-3">
        <CalloutText>
          Crédito de movimiento topeado al 30% del presupuesto: {Math.round(usedCredit)} / {cap} kcal
          usados ese día.
        </CalloutText>
      </Callout>

      <View className="mt-4">
        {options.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setActivityId(item.id)}
            className="mb-2 rounded-2xl border px-4 py-3"
            style={{
              borderColor: selected.id === item.id ? theme.hex.accent : theme.hex.line,
              backgroundColor:
                selected.id === item.id
                  ? theme.lockin
                    ? '#3A2418'
                    : theme.hex.secondary
                  : theme.hex.card,
            }}>
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
        minimumTrackTintColor={theme.hex.accent}
        thumbTintColor={theme.hex.flame}
        onValueChange={setMinutes}
      />
      <HelpText>
        La duración es aproximada. El crédito se estima con MET × tu peso × tiempo, y después se recorta
        si el día ya alcanzó el tope.
      </HelpText>

      <Card className="mt-4">
        <AppText tone="muted">Crédito que se va a sumar</AppText>
        <AppText className="text-2xl font-semibold" tone="forest">
          {creditToday} kcal
        </AppText>
        {creditToday < estimate ? (
          <Callout className="mt-3">
            <CalloutText>
              La estimación era {estimate} kcal; el tope diario deja {creditToday} de crédito para
              ese día.
            </CalloutText>
          </Callout>
        ) : null}
      </Card>

      <View className="mt-6">
        <Button
          label="Registrar actividad"
          onPress={() => {
            addExercise({
              date: entryDate,
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
