import { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppHeader } from '@/components/ui/AppHeader';
import { BudgetBar } from '@/components/ui/BudgetBar';
import { AppText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { MissionCard } from '@/components/ui/MissionCard';
import { Screen } from '@/components/ui/Screen';
import { SATIETY_TIPS } from '@/lib/copy';
import { formatKcal, todayKey } from '@/lib/dates';
import { isMissionComplete, missionForDay } from '@/lib/missions';
import {
  selectTodayExercise,
  selectTodayFood,
  selectTodayLog,
  useAppStore,
} from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';
import { usePalette } from '@/lib/usePalette';
import { useShallow } from 'zustand/react/shallow';

type MenuTarget =
  | { kind: 'food'; id: string; label: string }
  | { kind: 'exercise'; id: string; label: string };

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const log = useAppStore(useShallow(selectTodayLog));
  const foods = useAppStore(useShallow(selectTodayFood));
  const exercises = useAppStore(useShallow(selectTodayExercise));
  const logs = useAppStore((s) => s.dailyLogs);
  const savings = useAppStore((s) => s.savings);
  const removeFood = useAppStore((s) => s.removeFood);
  const removeExercise = useAppStore((s) => s.removeExercise);
  const updateFood = useAppStore((s) => s.updateFood);
  const updateExercise = useAppStore((s) => s.updateExercise);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editType, setEditType] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [foodError, setFoodError] = useState<string | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [tip] = useState(
    () => SATIETY_TIPS[Math.floor(Math.random() * SATIETY_TIPS.length)] ?? SATIETY_TIPS[0],
  );
  const theme = usePalette();

  if (!profile || !log) return null;

  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const lockin = profile.mode === 'tryhard';
  const greeting = profile.name?.trim() ? `Hola, ${profile.name.trim()}` : 'Hoy';
  const mission = missionForDay(todayKey(), profile.goalType);
  const missionDone = isMissionComplete(mission, foods, exercises, log);
  const remaining =
    profile.goalType === 'gain'
      ? Math.max(0, profile.dailyGoal - log.totalConsumed)
      : Math.max(0, profile.dailyGoal + log.exerciseCredit - log.totalConsumed);

  const openFoodEdit = (id: string) => {
    const item = foods.find((entry) => entry.id === id);
    if (!item) return;
    setEditingFoodId(item.id);
    setEditName(item.name);
    setEditCalories(String(item.calories));
    setFoodError(null);
  };

  const openExerciseEdit = (id: string) => {
    const item = exercises.find((entry) => entry.id === id);
    if (!item) return;
    setEditingExerciseId(item.id);
    setEditType(item.type);
    setEditMinutes(String(item.durationMinutes));
    setExerciseError(null);
  };

  const confirmDelete = (target: MenuTarget) => {
    Alert.alert('¿Eliminar esta entrada?', 'Se saca del registro de hoy y se vuelve a calcular el presupuesto.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (target.kind === 'food') removeFood(target.id);
          else removeExercise(target.id);
        },
      },
    ]);
  };

  return (
    <Screen header={<AppHeader />}>
      <Title className="text-[28px]">
        {greeting} {lockin ? '🔥' : '😊'}
      </Title>

      <View className="mt-4">
        <MissionCard
          mission={mission}
          done={missionDone}
          onPress={() => router.push(mission.href)}
        />
      </View>

      {lockin ? (
        <AppText tone="bronze" className="mt-2 text-sm font-medium">
          Racha {streak} días · mejor {historic}
        </AppText>
      ) : null}

      <Card className="mt-4" style={{ padding: 22 }}>
        <AppText tone="muted" className="mb-3 text-sm">
          Usado hoy
        </AppText>
        <AppText className="text-4xl font-semibold tracking-tight" style={{ lineHeight: 48 }}>
          {formatKcal(log.totalConsumed)}
        </AppText>
        <View className="mt-5 flex-row justify-between">
          <View>
            <AppText tone="muted" className="text-xs">
              {profile.goalType === 'gain' ? 'Falta para el piso' : 'Queda'}
            </AppText>
            <AppText className="text-lg font-semibold">{formatKcal(remaining)}</AppText>
          </View>
          <View className="items-end">
            <AppText tone="muted" className="text-xs">
              Banco de hoy
            </AppText>
            <AppText className="text-lg font-semibold text-forest">
              {log.isValidDay ? `+${log.saved} kcal` : 'Sin saldo'}
            </AppText>
          </View>
        </View>
        <View className="mt-5">
          <BudgetBar
            consumed={log.totalConsumed}
            dailyGoal={profile.dailyGoal}
            healthyRangeMin={profile.healthyRangeMin}
            healthyRangeMax={profile.healthyRangeMax}
            exerciseCredit={log.exerciseCredit}
            goalType={profile.goalType}
          />
        </View>
      </Card>

      {!lockin ? (
        <View className={`mt-3 rounded-2xl border px-4 py-3 ${theme.card}`}>
          <AppText tone="muted" className="text-xs uppercase tracking-wide">
            Tip
          </AppText>
          <AppText className="mt-1 text-sm leading-5">{tip}</AppText>
        </View>
      ) : null}

      {!lockin ? (
        <Pressable onPress={() => router.push('/(tabs)/achievements')} className="mt-4">
          <Card>
            <AppText tone="muted" className="text-sm">
              Racha
            </AppText>
            <AppText className="text-2xl font-semibold">{streak} días</AppText>
          </Card>
        </Pressable>
      ) : null}

      <Card className="mt-5">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-semibold">Comidas</AppText>
          <Pressable onPress={() => router.push('/food')} className={`rounded-full px-3 py-1 ${lockin ? 'bg-ember' : 'bg-sage'}`}>
            <AppText tone="forest" className="text-xs font-semibold">
              + Sumar
            </AppText>
          </Pressable>
        </View>
        {foods.length === 0 ? (
          <Pressable
            onPress={() => router.push('/food')}
            className={`items-center rounded-2xl border border-dashed py-6 ${lockin ? 'border-emberLine' : 'border-line'}`}>
            <Ionicons name="restaurant-outline" size={28} color={theme.hex.accent} />
            <AppText className="mt-2 font-medium">Todavía vacío</AppText>
            <AppText tone="muted" className="mt-1 text-xs">
              Buscá, escaneá o anotá a mano
            </AppText>
          </Pressable>
        ) : (
          foods.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setMenu({ kind: 'food', id: item.id, label: item.name })}
              className={`mb-2 flex-row items-center justify-between rounded-2xl px-4 py-3 ${theme.inset}`}>
              <AppText className="flex-1 pr-3 font-medium">{item.name}</AppText>
              <AppText>{item.calories} kcal</AppText>
            </Pressable>
          ))
        )}
      </Card>

      <Card className="mt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-semibold">Movimiento</AppText>
          <Pressable onPress={() => router.push('/activity')} className={`rounded-full px-3 py-1 ${lockin ? 'bg-ember' : 'bg-sage'}`}>
            <AppText tone="forest" className="text-xs font-semibold">
              + Sumar
            </AppText>
          </Pressable>
        </View>
        {exercises.length === 0 ? (
          <Pressable
            onPress={() => router.push('/activity')}
            className={`items-center rounded-2xl border border-dashed py-6 ${lockin ? 'border-emberLine' : 'border-line'}`}>
            <Ionicons name="walk-outline" size={28} color={theme.hex.accent} />
            <AppText className="mt-2 font-medium">Sin actividad</AppText>
            <AppText tone="muted" className="mt-1 text-xs">
              Suma crédito al presupuesto de hoy
            </AppText>
          </Pressable>
        ) : (
          exercises.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setMenu({ kind: 'exercise', id: item.id, label: item.type })}
              className={`mb-2 flex-row items-center justify-between rounded-2xl px-4 py-3 ${theme.inset}`}>
              <View className="flex-1 pr-3">
                <AppText className="font-medium">{item.type}</AppText>
                <AppText tone="muted" className="text-xs">
                  {item.durationMinutes} min
                </AppText>
              </View>
              <AppText>+{item.caloriesCredit} kcal</AppText>
            </Pressable>
          ))
        )}
      </Card>

      <Pressable onPress={() => router.push('/(tabs)/bank')} className="mt-5">
        <Card>
          <AppText tone="muted" className="text-sm">
            Banco
          </AppText>
          <AppText className="text-2xl font-semibold" tone="forest">
            {formatKcal(savings.totalSaved)}
          </AppText>
        </Card>
      </Pressable>

      <View className="mt-5 gap-3">
        <Button label="Registrar comida" onPress={() => router.push('/food')} />
        <Button
          label="Registrar actividad"
          variant="secondary"
          onPress={() => router.push('/activity')}
        />
      </View>

      <Modal visible={menu !== null} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={() => setMenu(null)}>
          <Pressable className={`w-full rounded-3xl border p-5 ${theme.card}`} onPress={() => undefined}>
            <AppText className="mb-1 text-lg font-semibold">{menu?.label}</AppText>
            <AppText tone="muted" className="mb-4 text-sm">
              ¿Qué querés hacer?
            </AppText>
            <Button
              label="Editar"
              onPress={() => {
                if (!menu) return;
                if (menu.kind === 'food') openFoodEdit(menu.id);
                else openExerciseEdit(menu.id);
                setMenu(null);
              }}
            />
            <View className="mt-2">
              <Button
                label="Eliminar entrada"
                variant="ghost"
                onPress={() => {
                  if (!menu) return;
                  const target = menu;
                  setMenu(null);
                  confirmDelete(target);
                }}
              />
            </View>
            <View className="mt-2">
              <Button label="Cancelar" variant="ghost" onPress={() => setMenu(null)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editingFoodId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingFoodId(null)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setEditingFoodId(null)}>
          <Pressable className={`w-full rounded-3xl border p-5 ${theme.card}`} onPress={() => undefined}>
            <AppText className="mb-3 text-lg font-semibold">Editar comida</AppText>
            <Field
              label="Nombre"
              value={editName}
              onChangeText={setEditName}
            />
            <Field
              label="Calorías"
              keyboardType="number-pad"
              value={editCalories}
              onChangeText={(value) => {
                setEditCalories(value);
                setFoodError(null);
              }}
            />
            {foodError ? (
              <AppText tone="bronze" className="mb-3 text-sm">
                {foodError}
              </AppText>
            ) : null}
            <Button
              label="Guardar"
              onPress={() => {
                const calories = Number(editCalories);
                if (!editingFoodId || !editName.trim() || Number.isNaN(calories) || calories < 0) {
                  setFoodError(
                    !editName.trim()
                      ? 'Indicá un nombre para reconocerlo.'
                      : 'Las calorías tienen que ser un número de 0 o más.',
                  );
                  return;
                }
                updateFood(editingFoodId, { name: editName, calories });
                setEditingFoodId(null);
                setFoodError(null);
              }}
            />
            <View className="mt-2">
              <Button label="Cancelar" variant="ghost" onPress={() => setEditingFoodId(null)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editingExerciseId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingExerciseId(null)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setEditingExerciseId(null)}>
          <Pressable className={`w-full rounded-3xl border p-5 ${theme.card}`} onPress={() => undefined}>
            <AppText className="mb-3 text-lg font-semibold">Editar actividad</AppText>
            <Field label="Tipo" value={editType} onChangeText={setEditType} />
            <Field
              label="Duración (min)"
              keyboardType="number-pad"
              value={editMinutes}
              onChangeText={(value) => {
                setEditMinutes(value);
                setExerciseError(null);
              }}
            />
            {exerciseError ? (
              <AppText tone="bronze" className="mb-3 text-sm">
                {exerciseError}
              </AppText>
            ) : null}
            <Button
              label="Guardar"
              onPress={() => {
                const minutes = Number(editMinutes);
                if (!editingExerciseId || !editType.trim() || Number.isNaN(minutes) || minutes < 1) {
                  setExerciseError(
                    !editType.trim()
                      ? 'Indicá un tipo de actividad.'
                      : 'La duración tiene que ser de al menos 1 minuto.',
                  );
                  return;
                }
                updateExercise(editingExerciseId, { type: editType, durationMinutes: minutes });
                setEditingExerciseId(null);
                setExerciseError(null);
              }}
            />
            <View className="mt-2">
              <Button label="Cancelar" variant="ghost" onPress={() => setEditingExerciseId(null)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
