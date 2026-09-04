import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { GoalEditor } from '@/components/GoalEditor';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText, HelpText } from '@/components/ui/AppText';
import { Button, Card, ChoiceChip } from '@/components/ui/Button';
import { Callout, CalloutText } from '@/components/ui/Callout';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { ACTIVITY_LEVEL_OPTIONS, SEX_OPTIONS } from '@/lib/copy';
import { DONATION_URL, SUPPORT_EMAIL } from '@/lib/legal';
import { useAppStore } from '@/lib/store';
import { MODE_LABELS } from '@/lib/theme';
import type { ActivityLevel, ActivityPreference, AppMode, Sex, UnitSystem } from '@/lib/types';
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

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetAll = useAppStore((s) => s.resetAll);
  const [name, setName] = useState(profile?.name ?? '');
  const unit = profile?.unitSystem ?? 'metric';
  const [weightText, setWeightText] = useState(
    profile ? formatWeight(profile.weightKg, unit) : '',
  );
  const ftIn = profile ? cmToFtIn(profile.heightCm) : { feet: 5, inches: 7 };
  const [heightCmText, setHeightCmText] = useState(
    profile ? formatHeightCm(profile.heightCm) : '',
  );
  const [feetText, setFeetText] = useState(String(ftIn.feet));
  const [inchesText, setInchesText] = useState(String(ftIn.inches));
  const [savedFlash, setSavedFlash] = useState(false);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = usePalette();

  useEffect(() => {
    setName(profile?.name ?? '');
  }, [profile?.name]);

  useEffect(() => {
    if (!profile) return;
    const nextUnit = profile.unitSystem ?? 'metric';
    setWeightText(formatWeight(profile.weightKg, nextUnit));
    setHeightCmText(formatHeightCm(profile.heightCm));
    const nextFt = cmToFtIn(profile.heightCm);
    setFeetText(String(nextFt.feet));
    setInchesText(String(nextFt.inches));
  }, [profile?.weightKg, profile?.heightCm, profile?.unitSystem]);

  useEffect(() => {
    if (!savedFlash) return;
    const handle = setTimeout(() => setSavedFlash(false), 1800);
    return () => clearTimeout(handle);
  }, [savedFlash]);

  if (!profile) return null;

  const save = (patch: Parameters<typeof updateProfile>[0]) => {
    updateProfile(patch);
    setSavedFlash(true);
  };

  const patchAge = (raw: string) => {
    const value = parseDecimal(raw);
    if (value === null || value < 14 || value > 90) return;
    save({ age: Math.round(value) });
  };

  const persistWeight = (raw: string) => {
    const value = parseDecimal(raw);
    if (value === null) return;
    const kg = unit === 'imperial' ? lbToKg(value) : value;
    if (!isValidMetricBody(kg, profile.heightCm)) return;
    save({ weightKg: Math.round(kg * 10) / 10 });
  };

  const persistHeight = () => {
    const cm =
      unit === 'imperial'
        ? ftInToCm(parseDecimal(feetText) ?? 0, parseDecimal(inchesText) ?? 0)
        : (parseDecimal(heightCmText) ?? 0);
    if (!isValidMetricBody(profile.weightKg, cm)) return;
    save({ heightCm: Math.round(cm * 10) / 10 });
  };

  const setUnitSystem = (next: UnitSystem) => {
    save({ unitSystem: next });
  };

  const persistName = (value: string) => {
    const trimmed = value.trim();
    save({ name: trimmed || undefined });
  };

  const confirmReset = () => {
    Alert.alert(
      'Empezar de cero',
      'Se borra el perfil, el historial y el banco de este dispositivo. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: () => {
            resetAll();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <Screen
      header={<AppHeader />}
      banner={
        savedFlash ? (
          <View className="px-5 py-2.5" style={{ backgroundColor: theme.hex.primary }}>
            <AppText tone="paper" className="text-center text-sm font-semibold">
              Guardado
            </AppText>
          </View>
        ) : null
      }>
      <Card className="mb-4">
        <AppText className="mb-3 font-semibold">Perfil</AppText>
        <Field
          label="Nombre (opcional)"
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (nameTimer.current) clearTimeout(nameTimer.current);
            nameTimer.current = setTimeout(() => persistName(value), 500);
          }}
          onEndEditing={(e) => persistName(e.nativeEvent.text)}
          help="Ejemplo: Juan, Juan Pablo, etc."
        />
        <Field
          label="Edad"
          keyboardType="number-pad"
          defaultValue={String(profile.age)}
          onEndEditing={(e) => patchAge(e.nativeEvent.text)}
        />
        <Field
          label={unit === 'imperial' ? 'Peso (lb)' : 'Peso (kg)'}
          keyboardType="decimal-pad"
          value={weightText}
          onChangeText={setWeightText}
          onEndEditing={(e) => persistWeight(e.nativeEvent.text)}
          help="Ejemplo: 70,50 o 70.50"
        />
        {unit === 'imperial' ? (
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Field
                label="Altura (pies)"
                keyboardType="number-pad"
                value={feetText}
                onChangeText={setFeetText}
                onEndEditing={persistHeight}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Pulgadas"
                keyboardType="decimal-pad"
                value={inchesText}
                onChangeText={setInchesText}
                onEndEditing={persistHeight}
              />
            </View>
          </View>
        ) : (
          <Field
            label="Altura (cm)"
            keyboardType="decimal-pad"
            value={heightCmText}
            onChangeText={setHeightCmText}
            onEndEditing={persistHeight}
          />
        )}
        <AppText className="mb-2 text-sm">Sistema de unidades</AppText>
        <View className="mb-2 flex-row flex-wrap">
          <ChoiceChip
            label="Métrico (kg, cm)"
            selected={unit === 'metric'}
            onPress={() => setUnitSystem('metric')}
          />
          <ChoiceChip
            label="Imperial (lb, ft)"
            selected={unit === 'imperial'}
            onPress={() => setUnitSystem('imperial')}
          />
        </View>
        <AppText className="mb-2 text-sm font-medium">Sexo (fórmula)</AppText>
        <View className="flex-row flex-wrap">
          {SEX_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={profile.sex === option.value}
              onPress={() => save({ sex: option.value as Sex })}
            />
          ))}
        </View>
        <AppText className="mb-2 mt-4 text-sm font-medium">Actividad habitual</AppText>
        <View className="flex-row flex-wrap">
          {ACTIVITY_LEVEL_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={profile.activityLevel === option.value}
              onPress={() => save({ activityLevel: option.value as ActivityLevel })}
            />
          ))}
        </View>
        <AppText className="mb-2 mt-4 text-sm font-medium">Movimiento</AppText>
        <HelpText>Filtra las sugerencias al registrar actividad. No se calcula según tu BMI.</HelpText>
        <View className="mt-2 flex-row flex-wrap">
          <ChoiceChip
            label="Bajo impacto"
            selected={profile.activityPreference === 'low_impact'}
            onPress={() => save({ activityPreference: 'low_impact' satisfies ActivityPreference })}
          />
          <ChoiceChip
            label="Más intensa"
            selected={profile.activityPreference === 'intense'}
            onPress={() => save({ activityPreference: 'intense' satisfies ActivityPreference })}
          />
        </View>
        <Callout className="mt-4">
          <CalloutText>
            TDEE {profile.tdee} kcal · rango seguro {profile.healthyRangeMin}–{profile.healthyRangeMax} kcal
          </CalloutText>
        </Callout>
      </Card>

      <Card className="mb-4">
        <AppText className="mb-3 font-semibold">Presupuesto</AppText>
        <GoalEditor
          goalType={profile.goalType}
          tdee={profile.tdee}
          healthyRangeMin={profile.healthyRangeMin}
          healthyRangeMax={profile.healthyRangeMax}
          dailyGoal={profile.dailyGoal}
          onChange={(next) => save(next)}
        />
      </Card>

      <Card className="mb-4">
        <AppText className="mb-1 font-semibold">Modo de la app</AppText>
        <HelpText>
          Chill es la versión base, limpia. Lock in es para tomártelo en serio: misión del día y racha adelante. El presupuesto no cambia.
        </HelpText>
        <View className="mt-3 flex-row flex-wrap">
          <ChoiceChip
            label={MODE_LABELS.normal}
            selected={profile.mode === 'normal'}
            onPress={() => save({ mode: 'normal' satisfies AppMode })}
          />
          <ChoiceChip
            label={MODE_LABELS.tryhard}
            selected={profile.mode === 'tryhard'}
            onPress={() => save({ mode: 'tryhard' satisfies AppMode })}
          />
        </View>
      </Card>

      <Card className="mb-4">
        <AppText className="mb-1 font-semibold">Comidas sin culpa</AppText>
        <HelpText>
          Marcálas en Recientes al registrar una comida (hoja, junto a la estrella). Hasta 3. Se registran como cualquier comida, dentro del presupuesto.
        </HelpText>
        {(profile.guiltFreeFoods ?? []).length === 0 ? (
          <AppText tone="muted" className="mt-3 text-sm">
            Todavía no marcaste ninguna.
          </AppText>
        ) : (
          (profile.guiltFreeFoods ?? []).map((item) => (
            <View
              key={item.name}
              className={`mt-2 flex-row items-center justify-between rounded-2xl px-4 py-3 ${theme.inset}`}>
              <AppText className="font-medium">{item.name}</AppText>
              <AppText tone="muted">{item.calories} kcal</AppText>
            </View>
          ))
        )}
      </Card>

      <Card className="mb-4">
        <AppText className="mb-1 font-semibold">Legal y apoyo</AppText>
        <HelpText>
          Calpound 1.0 es gratis, sin anuncios. Los datos quedan en este teléfono.
        </HelpText>
        <View className="mt-3 gap-2">
          <Button label="Privacidad" variant="ghost" onPress={() => router.push('/privacy' as Href)} />
          <Button
            label="Escribir al equipo"
            variant="ghost"
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Calpound`)}
          />
          {DONATION_URL ? (
            <Button
              label="Apoyar el proyecto"
              variant="ghost"
              onPress={() => Linking.openURL(DONATION_URL)}
            />
          ) : null}
        </View>
      </Card>

      <View className="mt-2">
        <Button label="Borrar todos los datos" variant="ghost" onPress={confirmReset} />
      </View>
    </Screen>
  );
}
