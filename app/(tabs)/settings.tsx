import { useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

import { GoalEditor } from '@/components/GoalEditor';
import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, ChoiceChip } from '@/components/ui/Button';
import { Callout, CalloutText } from '@/components/ui/Callout';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { ACTIVITY_LEVEL_OPTIONS, SEX_OPTIONS } from '@/lib/copy';
import { useAppStore } from '@/lib/store';
import type { ActivityLevel, ActivityPreference, AppMode, Sex } from '@/lib/types';

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetAll = useAppStore((s) => s.resetAll);

  if (!profile) return null;

  const patchNumber = (key: 'age' | 'weightKg' | 'heightCm', raw: string) => {
    const value = Number(raw.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) return;
    updateProfile({ [key]: value });
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
    <Screen>
      <Title>Ajustes</Title>
      <HelpText>Los cambios de peso, altura o meta recalculan el TDEE y vuelven a validar el presupuesto.</HelpText>

      <AppText className="mb-2 mt-5 font-semibold">Perfil</AppText>
      <Field
        label="Nombre (opcional)"
        defaultValue={profile.name ?? ''}
        onEndEditing={(e) => updateProfile({ name: e.nativeEvent.text.trim() || undefined })}
        help="Si lo cargás, Home te saluda por tu nombre."
      />
      <Field
        label="Edad"
        keyboardType="number-pad"
        defaultValue={String(profile.age)}
        onEndEditing={(e) => patchNumber('age', e.nativeEvent.text)}
        help="Se usa solo para estimar el gasto energético."
      />
      <Field
        label="Peso (kg)"
        keyboardType="decimal-pad"
        defaultValue={String(profile.weightKg)}
        onEndEditing={(e) => patchNumber('weightKg', e.nativeEvent.text)}
        help="Actualizalo cuando quieras; el cálculo se ajusta solo."
      />
      <Field
        label="Altura (cm)"
        keyboardType="number-pad"
        defaultValue={String(profile.heightCm)}
        onEndEditing={(e) => patchNumber('heightCm', e.nativeEvent.text)}
        help="También entra en Mifflin-St Jeor."
      />

      <AppText className="mb-2 text-sm font-medium">Sexo (fórmula)</AppText>
      <View className="flex-row flex-wrap">
        {SEX_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={profile.sex === option.value}
            onPress={() => updateProfile({ sex: option.value as Sex })}
          />
        ))}
      </View>
      <HelpText>{SEX_OPTIONS.find((o) => o.value === profile.sex)?.help ?? ''}</HelpText>

      <AppText className="mb-2 mt-5 text-sm font-medium">Actividad habitual</AppText>
      <View className="flex-row flex-wrap">
        {ACTIVITY_LEVEL_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={profile.activityLevel === option.value}
            onPress={() => updateProfile({ activityLevel: option.value as ActivityLevel })}
          />
        ))}
      </View>

      <CardMetrics
        tdee={profile.tdee}
        min={profile.healthyRangeMin}
        max={profile.healthyRangeMax}
      />

      <View className="mt-6">
        <GoalEditor
          goalType={profile.goalType}
          tdee={profile.tdee}
          healthyRangeMin={profile.healthyRangeMin}
          healthyRangeMax={profile.healthyRangeMax}
          dailyGoal={profile.dailyGoal}
          onChange={(next) => updateProfile(next)}
        />
      </View>

      <AppText className="mb-2 mt-6 font-semibold">Modo de la app</AppText>
      <View className="flex-row flex-wrap">
        <ChoiceChip
          label="Estándar"
          selected={profile.mode === 'normal'}
          onPress={() => updateProfile({ mode: 'normal' satisfies AppMode })}
        />
        <ChoiceChip
          label="Foco"
          selected={profile.mode === 'tryhard'}
          onPress={() => updateProfile({ mode: 'tryhard' satisfies AppMode })}
        />
      </View>
      <HelpText>
        Estándar muestra un dashboard simple. Foco (el modo más exigente) pone la racha y tu mejor
        marca histórica más adelante. La lógica del presupuesto no cambia.
      </HelpText>

      <AppText className="mb-2 mt-6 font-semibold">Preferencia de actividad</AppText>
      <View className="flex-row flex-wrap">
        <ChoiceChip
          label="Bajo impacto"
          selected={profile.activityPreference === 'low_impact'}
          onPress={() =>
            updateProfile({ activityPreference: 'low_impact' satisfies ActivityPreference })
          }
        />
        <ChoiceChip
          label="Más intensa"
          selected={profile.activityPreference === 'intense'}
          onPress={() =>
            updateProfile({ activityPreference: 'intense' satisfies ActivityPreference })
          }
        />
      </View>
      <HelpText>
        Esto solo filtra las sugerencias de movimiento. No se calcula según tu BMI ni tu contextura.
      </HelpText>

      <AppText className="mb-2 mt-6 font-semibold">Comidas sin culpa</AppText>
      <HelpText>
        Comidas que solés disfrutar pero te generan culpa. Las dejamos siempre a mano para que las
        puedas comer dentro de tu presupuesto, sin tener que “ganarlas”. Hasta 3.
      </HelpText>
      <GuiltFreeEditor
        foods={profile.guiltFreeFoods ?? []}
        onChange={(guiltFreeFoods) => updateProfile({ guiltFreeFoods })}
      />

      <View className="mt-8">
        <Button label="Borrar todos los datos" variant="ghost" onPress={confirmReset} />
      </View>
    </Screen>
  );
}

function GuiltFreeEditor({
  foods,
  onChange,
}: {
  foods: { name: string; calories: number }[];
  onChange: (foods: { name: string; calories: number }[]) => void;
}) {
  const slots = [0, 1, 2].map((index) => foods[index] ?? { name: '', calories: 0 });

  const patchSlot = (index: number, name: string, caloriesRaw: string) => {
    const next = slots.map((item, i) =>
      i === index
        ? { name: name.trim(), calories: Math.max(0, Math.round(Number(caloriesRaw) || 0)) }
        : item,
    );
    onChange(next.filter((item) => item.name.length > 0 && item.calories > 0));
  };

  return (
    <View className="mt-3">
      {slots.map((item, index) => (
        <View key={index} className="mb-2 flex-row gap-2">
          <View className="flex-1">
            <Field
              label={index === 0 ? 'Nombre' : ''}
              defaultValue={item.name}
              onEndEditing={(e) => patchSlot(index, e.nativeEvent.text, String(item.calories))}
            />
          </View>
          <View className="w-28">
            <Field
              label={index === 0 ? 'Kcal' : ''}
              keyboardType="number-pad"
              defaultValue={item.calories ? String(item.calories) : ''}
              onEndEditing={(e) => patchSlot(index, item.name, e.nativeEvent.text)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function CardMetrics({ tdee, min, max }: { tdee: number; min: number; max: number }) {
  return (
      <Callout className="mt-4">
        <CalloutText>
          TDEE actual {tdee} kcal. El presupuesto no puede salir del rango seguro {min}–{max} kcal.
        </CalloutText>
      </Callout>
  );
}
