import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { BudgetBar } from '@/components/ui/BudgetBar';
import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { formatKcal } from '@/lib/dates';
import {
  selectTodayExercise,
  selectTodayFood,
  selectTodayLog,
  useAppStore,
} from '@/lib/store';
import { bestStreak, currentStreak } from '@/lib/streaks';
import { useShallow } from 'zustand/react/shallow';

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

  if (!profile || !log) return null;

  const streak = currentStreak(logs);
  const historic = bestStreak(logs);
  const tryhard = profile.mode === 'tryhard';
  const remaining =
    profile.goalType === 'gain'
      ? Math.max(0, profile.dailyGoal - log.totalConsumed)
      : Math.max(0, profile.dailyGoal + log.exerciseCredit - log.totalConsumed);

  return (
    <Screen>
      <AppText tone="bronze" className="text-xs font-semibold uppercase tracking-[2px]">
        Calpound
      </AppText>
      <Title className="mt-1">{tryhard ? 'Hoy, en foco' : 'Hoy'}</Title>
      <HelpText>
        {profile.goalType === 'gain'
          ? 'Tu presupuesto de hoy es un piso: la idea es llegar al objetivo sin pasar el tope seguro.'
          : 'Tu presupuesto de hoy es un techo: lo que no uses, si el día queda en rango, se ahorra.'}
      </HelpText>

      <Card className="mt-5">
        <View className="flex-row items-end justify-between">
          <View>
            <AppText tone="muted" className="text-sm">
              Usado
            </AppText>
            <AppText className="text-3xl font-semibold">{formatKcal(log.totalConsumed)}</AppText>
          </View>
          <AppText tone="forest" className="font-semibold">
            {log.isValidDay ? `+${log.saved} en el banco` : 'Aún sin saldo de hoy'}
          </AppText>
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
        <AppText tone="muted" className="mt-3 text-sm">
          {profile.goalType === 'gain'
            ? remaining > 0
              ? `Te faltan ${formatKcal(remaining)} para el piso del día.`
              : 'Ya cubriste el piso. El margen hasta el tope es espacio extra.'
            : remaining > 0
              ? `Queda ${formatKcal(remaining)} de presupuesto.`
              : 'Usaste el presupuesto de hoy. El movimiento suma crédito extra si lo registrás.'}
        </AppText>
      </Card>

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
            onPress={() => {
              setEditingFoodId(item.id);
              setEditName(item.name);
              setEditCalories(String(item.calories));
            }}
            onLongPress={() => removeFood(item.id)}
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
            onPress={() => {
              setEditingExerciseId(item.id);
              setEditType(item.type);
              setEditMinutes(String(item.durationMinutes));
            }}
            onLongPress={() => removeExercise(item.id)}
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
      <HelpText>Tocá un ítem para editarlo. Manténé presionado para quitarlo.</HelpText>
      <Link href="/(tabs)/bank" className="mt-4">
        <AppText tone="forest" className="font-medium">
          Ir al banco →
        </AppText>
      </Link>

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
              onChangeText={setEditCalories}
              help="Ajustá el número si la porción no era exactamente esa."
            />
            <Button
              label="Guardar"
              onPress={() => {
                if (!editingFoodId || !editName.trim() || !Number(editCalories)) return;
                updateFood(editingFoodId, {
                  name: editName,
                  calories: Number(editCalories),
                });
                setEditingFoodId(null);
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
              onChangeText={setEditMinutes}
              help="Al guardar, el crédito del día se vuelve a calcular y se respeta el tope del 30%."
            />
            <Button
              label="Guardar"
              onPress={() => {
                if (!editingExerciseId || !editType.trim() || !Number(editMinutes)) return;
                updateExercise(editingExerciseId, {
                  type: editType,
                  durationMinutes: Number(editMinutes),
                });
                setEditingExerciseId(null);
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
