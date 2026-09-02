import { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { BudgetBar } from '@/components/ui/BudgetBar';
import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { SATIETY_TIPS } from '@/lib/copy';
import { formatKcal } from '@/lib/dates';
import {
  selectTodayExercise,
  selectTodayFood,
  selectTodayLog,
  useAppStore,
} from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';
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

  if (!profile || !log) return null;

  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const tryhard = profile.mode === 'tryhard';
  const greeting = profile.name?.trim() ? `Hoy, ${profile.name.trim()}` : 'Hoy';
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
    <Screen>
      <AppText tone="bronze" className="text-xs font-semibold uppercase tracking-[2px]">
        Calpound
      </AppText>
      <View className="mt-1 flex-row flex-wrap items-center">
        <Title className="mr-2">{greeting}</Title>
        {tryhard ? (
          <View className="rounded-full bg-bronze px-3 py-1">
            <AppText tone="paper" className="text-xs font-semibold">
              Modo Foco
            </AppText>
          </View>
        ) : null}
      </View>
      <HelpText>
        {profile.goalType === 'gain'
          ? 'Tu presupuesto de hoy es un piso: la idea es llegar al objetivo sin pasar el tope seguro.'
          : 'Tu presupuesto de hoy es un techo: lo que no uses, si el día queda en rango, se ahorra.'}
      </HelpText>

      <Card className="mt-5 border-forest bg-sage p-5">
        <AppText tone="muted" className="text-sm">
          Usado hoy
        </AppText>
        <AppText className="text-5xl font-semibold tracking-tight">
          {formatKcal(log.totalConsumed)}
        </AppText>
        <View className="mt-3 flex-row justify-between">
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
        <View className="mt-4">
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

      <View className="mt-3 rounded-2xl bg-paper px-4 py-3 border border-line">
        <AppText tone="muted" className="text-xs uppercase tracking-wide">
          Tip
        </AppText>
        <AppText className="mt-1 text-sm leading-5">{tip}</AppText>
      </View>

      <View className={`mt-4 flex-row gap-3 ${tryhard ? 'flex-col' : ''}`}>
        <Card className="flex-1">
          <AppText tone="muted" className="text-sm">
            Banco
          </AppText>
          <AppText className="text-2xl font-semibold text-forest">
            {formatKcal(savings.totalSaved)}
          </AppText>
        </Card>
        <Card className="flex-1">
          <AppText tone="muted" className="text-sm">
            Racha
          </AppText>
          <AppText className="text-2xl font-semibold">{streak} días</AppText>
          {tryhard ? (
            <AppText tone="bronze" className="mt-1 text-sm font-medium">
              Mejor histórica: {historic} días
            </AppText>
          ) : null}
        </Card>
      </View>

      <View className="mt-5 gap-3">
        <Button label="Registrar comida" onPress={() => router.push('/food')} />
        <Button
          label="Registrar actividad"
          variant="secondary"
          onPress={() => router.push('/activity')}
        />
        <HelpText>
          Registrar movimiento suma crédito a tu presupuesto de hoy. Está siempre a mano: no es una
          sugerencia para “compensar” una comida.
        </HelpText>
      </View>

      <AppText className="mb-2 mt-6 font-semibold">Comidas de hoy</AppText>
      {foods.length === 0 ? (
        <AppText tone="muted">Todavía no cargaste nada. Podés buscar, escanear o anotar a mano.</AppText>
      ) : (
        foods.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setMenu({ kind: 'food', id: item.id, label: item.name })}
            className="mb-2 flex-row items-center justify-between rounded-2xl bg-paper px-4 py-3 border border-line">
            <View className="flex-1 pr-3">
              <AppText className="font-medium">{item.name}</AppText>
              <AppText tone="muted" className="text-xs">
                {item.source === 'manual' ? 'Carga manual' : item.source === 'barcode' ? 'Código' : 'Búsqueda'}
              </AppText>
            </View>
            <AppText>{item.calories} kcal</AppText>
          </Pressable>
        ))
      )}

      <AppText className="mb-2 mt-6 font-semibold">Movimiento de hoy</AppText>
      {exercises.length === 0 ? (
        <AppText tone="muted">Sin actividad registrada. Cuando quieras, sumala.</AppText>
      ) : (
        exercises.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setMenu({ kind: 'exercise', id: item.id, label: item.type })}
            className="mb-2 flex-row items-center justify-between rounded-2xl bg-paper px-4 py-3 border border-line">
            <View>
              <AppText className="font-medium">{item.type}</AppText>
              <AppText tone="muted" className="text-xs">
                {item.durationMinutes} min
              </AppText>
            </View>
            <AppText>+{item.caloriesCredit} kcal</AppText>
          </Pressable>
        ))
      )}
      <HelpText>Tocá una entrada para editarla o quitarla.</HelpText>
      <Link href="/(tabs)/bank" className="mt-4">
        <AppText tone="forest" className="font-medium">
          Ir al banco →
        </AppText>
      </Link>

      <Modal visible={menu !== null} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={() => setMenu(null)}>
          <Pressable className="w-full rounded-3xl border border-line bg-cream p-5" onPress={() => undefined}>
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
          <Pressable className="w-full rounded-3xl border border-line bg-cream p-5" onPress={() => undefined}>
            <AppText className="mb-3 text-lg font-semibold">Editar comida</AppText>
            <Field
              label="Nombre"
              value={editName}
              onChangeText={setEditName}
              help="Cambia el nombre si querés reconocerlo mejor la próxima vez."
            />
            <Field
              label="Calorías"
              keyboardType="number-pad"
              value={editCalories}
              onChangeText={(value) => {
                setEditCalories(value);
                setFoodError(null);
              }}
              help="Ajustá el número si la porción no era exactamente esa."
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
          <Pressable className="w-full rounded-3xl border border-line bg-cream p-5" onPress={() => undefined}>
            <AppText className="mb-3 text-lg font-semibold">Editar actividad</AppText>
            <Field
              label="Tipo"
              value={editType}
              onChangeText={setEditType}
              help="El nombre de la actividad. Si coincide con una sugerida, el crédito se recalcula."
            />
            <Field
              label="Duración (min)"
              keyboardType="number-pad"
              value={editMinutes}
              onChangeText={(value) => {
                setEditMinutes(value);
                setExerciseError(null);
              }}
              help="Al guardar, el crédito del día se vuelve a calcular y se respeta el tope del 30%."
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
