import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { GoalEditor } from '@/components/GoalEditor';
import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card, ChoiceChip } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import {
  calculateHealthyRange,
  calculateTdee,
  suggestedDailyGoal,
} from '@/lib/calculations';
import { ACTIVITY_LEVEL_OPTIONS, SEX_OPTIONS } from '@/lib/copy';
import { useAppStore } from '@/lib/store';
import type { ActivityLevel, ActivityPreference, GoalType, Sex } from '@/lib/types';

type Draft = {
  age: string;
  weightKg: string;
  heightCm: string;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dailyGoal: number;
  activityPreference: ActivityPreference;
};

const INITIAL: Draft = {
  age: '30',
  weightKg: '70',
  heightCm: '170',
  sex: 'female',
  activityLevel: 'light',
  goalType: 'lose',
  dailyGoal: 0,
  activityPreference: 'low_impact',
};

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(INITIAL);

  const numbers = {
    age: Number(draft.age),
    weightKg: Number(draft.weightKg),
    heightCm: Number(draft.heightCm),
  };
  const profileOk =
    numbers.age >= 14 &&
    numbers.age <= 90 &&
    numbers.weightKg >= 30 &&
    numbers.weightKg <= 250 &&
    numbers.heightCm >= 120 &&
    numbers.heightCm <= 230;

  const metrics = useMemo(() => {
    if (!profileOk) return null;
    const tdee = calculateTdee(
      numbers.weightKg,
      numbers.heightCm,
      numbers.age,
      draft.sex,
      draft.activityLevel,
    );
    const range = calculateHealthyRange(tdee, draft.sex);
    return { tdee, ...range };
  }, [profileOk, numbers.weightKg, numbers.heightCm, numbers.age, draft.sex, draft.activityLevel]);

  const goToGoal = () => {
    if (!metrics) return;
    setDraft((prev) => ({
      ...prev,
      dailyGoal: suggestedDailyGoal(prev.goalType, metrics.tdee, metrics.min, metrics.max),
    }));
    setStep(2);
  };

  const finish = () => {
    if (!metrics) return;
    completeOnboarding({
      age: numbers.age,
      weightKg: numbers.weightKg,
      heightCm: numbers.heightCm,
      sex: draft.sex,
      activityLevel: draft.activityLevel,
      goalType: draft.goalType,
      tdee: metrics.tdee,
      healthyRangeMin: metrics.min,
      healthyRangeMax: metrics.max,
      dailyGoal: draft.dailyGoal,
      mode: 'normal',
      activityPreference: draft.activityPreference,
    });
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <AppText tone="bronze" className="text-xs font-semibold uppercase tracking-[2px]">
        Calpound · paso {step + 1} de 5
      </AppText>

      {step === 0 && (
        <View className="mt-4">
          <Title>Tu presupuesto de energía</Title>
          <AppText tone="muted" className="mt-3 text-base leading-6">
            Calpound trata las calorías como un presupuesto: definís un rango saludable, vas
            registrando el día y lo que queda (o lo que sumás, si tu meta es subir) se ahorra en un
            banco para usarlo después.
          </AppText>
          <View className="mt-8">
            <Button label="Empezar" onPress={() => setStep(1)} />
          </View>
        </View>
      )}

      {step === 1 && (
        <View className="mt-4">
          <Title>Contanos un poco de vos</Title>
          <AppText tone="muted" className="mt-2 mb-5">
            Usamos Mifflin-St Jeor, una fórmula estándar, para estimar cuánta energía gastás en un
            día típico (TDEE).
          </AppText>
          <Field
            label="Edad"
            keyboardType="number-pad"
            value={draft.age}
            onChangeText={(age) => setDraft((p) => ({ ...p, age }))}
            help="La edad entra en la fórmula del gasto basal. No hace falta ser exacto al día."
          />
          <Field
            label="Peso (kg)"
            keyboardType="decimal-pad"
            value={draft.weightKg}
            onChangeText={(weightKg) => setDraft((p) => ({ ...p, weightKg }))}
            help="Un peso aproximado alcanza. Podés actualizarlo después en Configuración."
          />
          <Field
            label="Altura (cm)"
            keyboardType="number-pad"
            value={draft.heightCm}
            onChangeText={(heightCm) => setDraft((p) => ({ ...p, heightCm }))}
            help="La altura también alimenta el cálculo de gasto energético."
          />
          <AppText className="mb-2 text-sm font-medium">Sexo (para la fórmula)</AppText>
          <View className="flex-row flex-wrap">
            {SEX_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={draft.sex === option.value}
                onPress={() => setDraft((p) => ({ ...p, sex: option.value }))}
              />
            ))}
          </View>
          <HelpText>{SEX_OPTIONS.find((o) => o.value === draft.sex)?.help ?? ''}</HelpText>
          <AppText className="mb-2 mt-5 text-sm font-medium">Actividad habitual</AppText>
          <View className="flex-row flex-wrap">
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={draft.activityLevel === option.value}
                onPress={() => setDraft((p) => ({ ...p, activityLevel: option.value }))}
              />
            ))}
          </View>
          <HelpText>
            {ACTIVITY_LEVEL_OPTIONS.find((o) => o.value === draft.activityLevel)?.help ?? ''}
          </HelpText>
          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button label="Atrás" variant="ghost" onPress={() => setStep(0)} />
            </View>
            <View className="flex-1">
              <Button label="Calcular" onPress={goToGoal} disabled={!profileOk} />
            </View>
          </View>
        </View>
      )}

      {step === 2 && metrics && (
        <View className="mt-4">
          <Title>Tu rango saludable</Title>
          <Card className="mt-5">
            <AppText tone="muted" className="text-sm">
              Gasto estimado (TDEE)
            </AppText>
            <AppText className="text-3xl font-semibold text-forest">{metrics.tdee} kcal</AppText>
            <AppText tone="muted" className="mt-3 text-sm">
              Piso seguro {metrics.min} · Tope seguro {metrics.max}
            </AppText>
          </Card>
          <HelpText>
            El TDEE es una estimación de lo que tu cuerpo usa en un día típico. El piso y el tope
            son límites de seguridad: la app no deja configurar un objetivo fuera de ese corredor.
          </HelpText>
          <View className="mt-8">
            <GoalEditor
              goalType={draft.goalType}
              tdee={metrics.tdee}
              healthyRangeMin={metrics.min}
              healthyRangeMax={metrics.max}
              dailyGoal={draft.dailyGoal}
              onChange={(next) => setDraft((p) => ({ ...p, ...next }))}
            />
          </View>
          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button label="Atrás" variant="ghost" onPress={() => setStep(1)} />
            </View>
            <View className="flex-1">
              <Button label="Continuar" onPress={() => setStep(3)} />
            </View>
          </View>
        </View>
      )}

      {step === 3 && (
        <View className="mt-4">
          <Title>¿Cómo preferís moverte?</Title>
          <AppText tone="muted" className="mt-2 mb-5">
            Elegilo vos. Calpound no infiere intensidad según tu peso o tu altura: solo filtra las
            sugerencias con esta preferencia.
          </AppText>
          <ChoiceChip
            label="Bajo impacto"
            selected={draft.activityPreference === 'low_impact'}
            onPress={() => setDraft((p) => ({ ...p, activityPreference: 'low_impact' }))}
          />
          <ChoiceChip
            label="Más intensa"
            selected={draft.activityPreference === 'intense'}
            onPress={() => setDraft((p) => ({ ...p, activityPreference: 'intense' }))}
          />
          <HelpText>
            {draft.activityPreference === 'low_impact'
              ? 'Vamos a sugerirte cosas como caminar, yoga, bici suave o natación tranquila.'
              : 'Vamos a sugerirte cosas como correr, HIIT, fuerza o series de natación.'}
          </HelpText>
          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button label="Atrás" variant="ghost" onPress={() => setStep(2)} />
            </View>
            <View className="flex-1">
              <Button label="Continuar" onPress={() => setStep(4)} />
            </View>
          </View>
        </View>
      )}

      {step === 4 && (
        <View className="mt-4">
          <Title>Un aviso importante</Title>
          <Card className="mt-5">
            <AppText className="leading-6">
              Calpound es una herramienta de organización, no un profesional de la salud. No
              reemplaza asesoramiento nutricional ni médico. Si tenés una condición clínica, estás
              embarazada o tenés dudas, consultá con alguien formado.
            </AppText>
          </Card>
          <HelpText>
            El tono de la app es de presupuesto, no de culpa: un día fuera de rango simplemente no
            suma saldo, y al siguiente arrancás de nuevo.
          </HelpText>
          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button label="Atrás" variant="ghost" onPress={() => setStep(3)} />
            </View>
            <View className="flex-1">
              <Button label="Crear mi presupuesto" onPress={finish} />
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}
