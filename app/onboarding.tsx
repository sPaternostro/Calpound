import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { GoalEditor } from '@/components/GoalEditor';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card, ChoiceChip } from '@/components/ui/Button';
import { Callout, CalloutText } from '@/components/ui/Callout';
import { Field } from '@/components/ui/Field';
import { AppHeader } from '@/components/ui/AppHeader';
import { Screen } from '@/components/ui/Screen';
import { SummaryRow } from '@/components/ui/SummaryRow';
import {
  calculateHealthyRange,
  calculateTdee,
  suggestedDailyGoal,
} from '@/lib/calculations';
import { ACTIVITY_LEVEL_OPTIONS, GOAL_OPTIONS, SEX_OPTIONS } from '@/lib/copy';
import { useAppStore } from '@/lib/store';
import type {
  ActivityLevel,
  ActivityPreference,
  AppMode,
  GoalType,
  Sex,
  UnitSystem,
} from '@/lib/types';
import {
  cmToFtIn,
  formatHeightCm,
  formatWeight,
  ftInToCm,
  isValidMetricBody,
  lbToKg,
  parseDecimal,
} from '@/lib/units';
import { usePalette } from '@/lib/usePalette';

type Draft = {
  name: string;
  age: string;
  weight: string;
  heightCm: string;
  feet: string;
  inches: string;
  unitSystem: UnitSystem;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dailyGoal: number;
  activityPreference: ActivityPreference;
  mode: AppMode;
};

const INITIAL: Draft = {
  name: '',
  age: '30',
  weight: '70',
  heightCm: '170',
  feet: '5',
  inches: '7',
  unitSystem: 'metric',
  sex: 'female',
  activityLevel: 'light',
  goalType: 'lose',
  dailyGoal: 0,
  activityPreference: 'low_impact',
  mode: 'normal',
};

function NumberedBullet({ n, children }: { n: number; children: string }) {
  const theme = usePalette();
  return (
    <View
      className="flex-row items-start rounded-2xl border px-4 py-3"
      style={{ borderColor: theme.hex.line, backgroundColor: theme.hex.card }}>
      <View
        className="mr-3 h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.hex.primary }}>
        <AppText className="text-xs" style={{ color: theme.hex.onPrimary }}>
          {n}
        </AppText>
      </View>
      <AppText className="flex-1 leading-5">{children}</AppText>
    </View>
  );
}

function FooterNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      {onBack ? (
        <View className="flex-1">
          <Button label="Atrás" variant="ghost" onPress={onBack} />
        </View>
      ) : null}
      <View className="flex-1">
        <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} />
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(INITIAL);

  const weightKg =
    draft.unitSystem === 'imperial'
      ? lbToKg(parseDecimal(draft.weight) ?? 0)
      : (parseDecimal(draft.weight) ?? 0);
  const heightCm =
    draft.unitSystem === 'imperial'
      ? ftInToCm(parseDecimal(draft.feet) ?? 0, parseDecimal(draft.inches) ?? 0)
      : (parseDecimal(draft.heightCm) ?? 0);
  const age = parseDecimal(draft.age) ?? 0;
  const profileOk = age >= 14 && age <= 90 && isValidMetricBody(weightKg, heightCm);

  const metrics = useMemo(() => {
    if (!profileOk) return null;
    const tdee = calculateTdee(weightKg, heightCm, age, draft.sex, draft.activityLevel);
    const range = calculateHealthyRange(tdee, draft.sex);
    return { tdee, ...range };
  }, [profileOk, weightKg, heightCm, age, draft.sex, draft.activityLevel]);

  const setUnit = (unitSystem: UnitSystem) => {
    if (unitSystem === draft.unitSystem) return;
    const kg =
      draft.unitSystem === 'imperial'
        ? lbToKg(parseDecimal(draft.weight) ?? 70)
        : (parseDecimal(draft.weight) ?? 70);
    const cm =
      draft.unitSystem === 'imperial'
        ? ftInToCm(parseDecimal(draft.feet) ?? 5, parseDecimal(draft.inches) ?? 7)
        : (parseDecimal(draft.heightCm) ?? 170);
    const ftIn = cmToFtIn(cm);
    setDraft((prev) => ({
      ...prev,
      unitSystem,
      weight: formatWeight(kg, unitSystem),
      heightCm: formatHeightCm(cm),
      feet: String(ftIn.feet),
      inches: String(ftIn.inches),
    }));
  };

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
      name: draft.name.trim() || undefined,
      age,
      weightKg: Math.round(weightKg * 10) / 10,
      heightCm: Math.round(heightCm),
      sex: draft.sex,
      activityLevel: draft.activityLevel,
      goalType: draft.goalType,
      tdee: metrics.tdee,
      healthyRangeMin: metrics.min,
      healthyRangeMax: metrics.max,
      dailyGoal: draft.dailyGoal,
      mode: draft.mode,
      activityPreference: draft.activityPreference,
      unitSystem: draft.unitSystem,
    });
    router.replace('/(tabs)');
  };

  const footer =
    step === 0 ? (
      <FooterNav onNext={() => setStep(1)} nextLabel="Empezar" />
    ) : step === 1 ? (
      <FooterNav
        onBack={() => setStep(0)}
        onNext={goToGoal}
        nextLabel="Calcular"
        nextDisabled={!profileOk}
      />
    ) : step === 2 ? (
      <FooterNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continuar" />
    ) : step === 3 ? (
      <FooterNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continuar" />
    ) : step === 4 ? (
      <FooterNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Continuar" />
    ) : (
      <FooterNav
        onBack={() => setStep(4)}
        onNext={finish}
        nextLabel="Crear mi presupuesto"
        nextDisabled={!metrics}
      />
    );

  return (
    <Screen header={<AppHeader />} footer={footer}>
      <OnboardingProgress current={step + 1} />

      {step === 0 && (
        <View>
          <Title>Tu presupuesto de energía</Title>
          <AppText tone="muted" className="mt-3 text-base leading-6">
            Calpound trata las calorías como un presupuesto: definís un rango saludable, vas
            registrando el día y lo que queda (o lo que sumás, si tu meta es subir) se ahorra en un
            banco para usarlo después.
          </AppText>
          <View className="mt-6 gap-3">
            <NumberedBullet n={1}>
              Definís tu rango saludable y un presupuesto diario.
            </NumberedBullet>
            <NumberedBullet n={2}>
              Cada día en rango suma al banco; gastás el ahorro cuando quieras, en algo puntual.
            </NumberedBullet>
            <NumberedBullet n={3}>
              El tono es de presupuesto, no de culpa: un día fuera de rango simplemente no suma
              saldo, y al siguiente arrancás de nuevo.
            </NumberedBullet>
          </View>
        </View>
      )}

      {step === 1 && (
        <View>
          <Title>Contanos un poco de vos</Title>
          <AppText tone="muted" className="mt-2 mb-5">
            Usamos Mifflin-St Jeor, una fórmula estándar, para estimar cuánta energía gastás en un
            día típico (TDEE).
          </AppText>
          <AppText className="mb-2 text-sm">Sistema de unidades</AppText>
          <View className="flex-row flex-wrap">
            <ChoiceChip
              label="Métrico (kg, cm)"
              selected={draft.unitSystem === 'metric'}
              onPress={() => setUnit('metric')}
            />
            <ChoiceChip
              label="Imperial (lb, ft)"
              selected={draft.unitSystem === 'imperial'}
              onPress={() => setUnit('imperial')}
            />
          </View>
          <Field
            label="Nombre (opcional)"
            value={draft.name}
            onChangeText={(name) => setDraft((p) => ({ ...p, name }))}
            help="¿Cómo te gustaría que te llamemos? Podés dejarlo vacío."
          />
          <Field
            label="Edad"
            keyboardType="number-pad"
            value={draft.age}
            onChangeText={(next) => setDraft((p) => ({ ...p, age: next }))}
            help="La edad entra en la fórmula del gasto basal. No hace falta ser exacto al día."
          />
          <Field
            label={draft.unitSystem === 'imperial' ? 'Peso (lb)' : 'Peso (kg)'}
            keyboardType="decimal-pad"
            value={draft.weight}
            onChangeText={(weight) => setDraft((p) => ({ ...p, weight }))}
            help="Ejemplo: 70,50 o 70.50. Un aproximado alcanza; se actualiza en Ajustes."
          />
          {draft.unitSystem === 'imperial' ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Field
                  label="Altura (pies)"
                  keyboardType="number-pad"
                  value={draft.feet}
                  onChangeText={(feet) => setDraft((p) => ({ ...p, feet }))}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Pulgadas"
                  keyboardType="decimal-pad"
                  value={draft.inches}
                  onChangeText={(inches) => setDraft((p) => ({ ...p, inches }))}
                />
              </View>
            </View>
          ) : (
            <Field
              label="Altura (cm)"
              keyboardType="decimal-pad"
              value={draft.heightCm}
              onChangeText={(heightCm) => setDraft((p) => ({ ...p, heightCm }))}
              help="La altura también alimenta el cálculo de gasto energético."
            />
          )}
          <AppText className="mb-2 text-sm">Sexo (para la fórmula)</AppText>
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
          <AppText className="mb-2 mt-5 text-sm">Actividad habitual</AppText>
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
        </View>
      )}

      {step === 2 && metrics && (
        <View>
          <Title>Tu rango saludable</Title>
          <Card className="mt-5 p-5">
            <SummaryRow label="Gasto estimado (TDEE)" value={`${metrics.tdee} kcal`} />
            <SummaryRow label="Rango seguro" value={`${metrics.min} – ${metrics.max} kcal`} last />
          </Card>
          <Callout className="mt-3">
            <CalloutText>
              El TDEE es una estimación con Mifflin-St Jeor: puede variar según tu composición
              corporal. El piso y el tope son límites de seguridad; la app no deja configurar un
              objetivo fuera de ese corredor.
            </CalloutText>
          </Callout>
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
        </View>
      )}

      {step === 3 && (
        <View>
          <Title>¿Cómo preferís moverte?</Title>
          <AppText tone="muted" className="mt-2 mb-5">
            Elegilo vos. Calpound no infiere intensidad según tu peso o tu altura: solo filtra las
            sugerencias con esta preferencia.
          </AppText>
          <View className="flex-row flex-wrap">
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
          </View>
          <HelpText>
            {draft.activityPreference === 'low_impact'
              ? 'Vamos a sugerirte cosas como caminar, yoga, bici suave o natación tranquila.'
              : 'Vamos a sugerirte cosas como correr, HIIT, fuerza o series de natación.'}
          </HelpText>
        </View>
      )}

      {step === 4 && (
        <View>
          <Title>¿Cómo querés usar Calpound?</Title>
          <AppText tone="muted" className="mt-2 mb-5">
            Las reglas del presupuesto son las mismas. Cambia el ritmo de la app.
          </AppText>
          <View className="flex-row flex-wrap">
            <ChoiceChip
              label="Chill"
              selected={draft.mode === 'normal'}
              onPress={() => setDraft((p) => ({ ...p, mode: 'normal' }))}
            />
            <ChoiceChip
              label="Lock in"
              selected={draft.mode === 'tryhard'}
              onPress={() => setDraft((p) => ({ ...p, mode: 'tryhard' }))}
            />
          </View>
          <HelpText>
            {draft.mode === 'normal'
              ? 'Chill es la versión base: limpia, simple y sin ruido extra.'
              : 'Lock in es para quienes quieren tomárselo en serio: más foco en la misión del día y en la racha.'}
          </HelpText>
        </View>
      )}

      {step === 5 && metrics && (
        <View>
          <Title>Confirmá tus datos</Title>
          <Card className="mt-5 p-5">
            <AppText className="mb-1 text-lg">Esto es lo que vas a crear</AppText>
            {draft.name.trim() ? <SummaryRow label="Nombre" value={draft.name.trim()} /> : null}
            <SummaryRow
              label="Unidades"
              value={draft.unitSystem === 'imperial' ? 'Imperial' : 'Métrico'}
            />
            <SummaryRow
              label="Peso"
              value={
                draft.unitSystem === 'imperial'
                  ? `${draft.weight} lb`
                  : `${draft.weight} kg`
              }
            />
            <SummaryRow
              label="Altura"
              value={
                draft.unitSystem === 'imperial'
                  ? `${draft.feet}′ ${draft.inches}″`
                  : `${draft.heightCm} cm`
              }
            />
            <SummaryRow label="Gasto estimado (TDEE)" value={`${metrics.tdee} kcal`} />
            <SummaryRow label="Rango seguro" value={`${metrics.min} – ${metrics.max} kcal`} />
            <SummaryRow
              label="Meta"
              value={GOAL_OPTIONS.find((item) => item.value === draft.goalType)?.label ?? draft.goalType}
            />
            <SummaryRow label="Presupuesto diario" value={`${draft.dailyGoal} kcal`} />
            <SummaryRow
              label="Movimiento"
              value={draft.activityPreference === 'low_impact' ? 'Bajo impacto' : 'Más intensa'}
            />
            <SummaryRow label="Modo" value={draft.mode === 'normal' ? 'Chill' : 'Lock in'} last />
          </Card>
          <Callout className="mt-4">
            <CalloutText>
              Calpound es una herramienta de organización, no un profesional de la salud. No
              reemplaza asesoramiento nutricional ni médico. Si tenés una condición clínica, estás
              embarazada o tenés dudas, consultá con alguien formado.
            </CalloutText>
          </Callout>
        </View>
      )}
    </Screen>
  );
}
