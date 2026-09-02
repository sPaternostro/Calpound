import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedAchievements } from './achievements';
import { ACTIVITY_OPTIONS, estimateActivityCalories } from './activities';
import {
  capExerciseCredit,
  computeDailyLog,
  rebuildProfileMetrics,
} from './calculations';
import { createId, todayKey } from './dates';
import { bestStreak, currentStreak, validDaysInWeek } from './streaks';
import type {
  Achievement,
  ActivityPreference,
  AppMode,
  CatalogFood,
  DailyLog,
  ExerciseEntry,
  FoodEntry,
  GoalType,
  SavingsBalance,
  UserProfile,
} from './types';

const STORAGE_KEY = 'calpound-store-v1';

export interface AppState {
  hasHydrated: boolean;
  hasOnboarded: boolean;
  profile: UserProfile | null;
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  dailyLogs: Record<string, DailyLog>;
  savings: SavingsBalance;
  achievements: Achievement[];
  catalog: CatalogFood[];
  setHasHydrated: (value: boolean) => void;
  completeOnboarding: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addFood: (input: Omit<FoodEntry, 'id' | 'date'> & { date?: string }) => void;
  updateFood: (id: string, patch: Partial<Pick<FoodEntry, 'name' | 'calories'>>) => void;
  removeFood: (id: string) => void;
  toggleFavorite: (name: string) => void;
  addExercise: (
    input: Omit<ExerciseEntry, 'id' | 'date' | 'caloriesCredit'> & {
      date?: string;
      caloriesCredit: number;
    },
  ) => void;
  updateExercise: (
    id: string,
    patch: Partial<Pick<ExerciseEntry, 'type' | 'durationMinutes'>>,
  ) => void;
  removeExercise: (id: string) => void;
  spendSavings: (amount: number, note: string) => { ok: boolean; message: string };
  resetAll: () => void;
}

const emptySavings = (): SavingsBalance => ({ totalSaved: 0, history: [] });

function upsertCatalog(catalog: CatalogFood[], entry: FoodEntry): CatalogFood[] {
  const key = entry.name.trim().toLowerCase();
  const existing = catalog.find((item) => item.name.trim().toLowerCase() === key);
  const next: CatalogFood = {
    name: entry.name.trim(),
    calories: entry.calories,
    source: entry.source,
    barcode: entry.barcode,
    servingLabel: entry.servingLabel,
    lastUsedAt: new Date().toISOString(),
    isFavorite: existing?.isFavorite ?? !!entry.isFavorite,
  };
  return [next, ...catalog.filter((item) => item.name.trim().toLowerCase() !== key)].slice(
    0,
    80,
  );
}

function recomputeDate(
  state: Pick<
    AppState,
    'profile' | 'foodEntries' | 'exerciseEntries' | 'dailyLogs' | 'savings'
  >,
  date: string,
): Pick<AppState, 'dailyLogs' | 'savings'> {
  const profile = state.profile;
  if (!profile) return { dailyLogs: state.dailyLogs, savings: state.savings };

  const totalConsumed = state.foodEntries
    .filter((item) => item.date === date)
    .reduce((sum, item) => sum + item.calories, 0);
  const rawCredit = state.exerciseEntries
    .filter((item) => item.date === date)
    .reduce((sum, item) => sum + item.caloriesCredit, 0);

  const log = computeDailyLog({
    date,
    goalType: profile.goalType,
    dailyGoal: profile.dailyGoal,
    healthyRangeMin: profile.healthyRangeMin,
    healthyRangeMax: profile.healthyRangeMax,
    totalConsumed,
    rawExerciseCredit: rawCredit,
  });

  const dailyLogs = { ...state.dailyLogs, [date]: log };
  const withoutTodayEarn = state.savings.history.filter(
    (item) => !(item.type === 'earned' && item.date === date),
  );
  const history = log.isValidDay && log.saved > 0
    ? [
        {
          id: `earn-${date}`,
          date,
          amount: log.saved,
          type: 'earned' as const,
          note: 'Saldo del día',
        },
        ...withoutTodayEarn,
      ]
    : withoutTodayEarn;

  const totalSaved = history.reduce(
    (sum, item) => sum + (item.type === 'earned' ? item.amount : -item.amount),
    0,
  );

  return {
    dailyLogs,
    savings: { totalSaved: Math.max(0, Math.round(totalSaved)), history },
  };
}

function unlockAchievements(state: AppState): Achievement[] {
  const now = new Date().toISOString();
  const streak = currentStreak(state.dailyLogs);
  const historic = bestStreak(state.dailyLogs);
  const weekValid = validDaysInWeek(state.dailyLogs, todayKey());
  const validCount = Object.values(state.dailyLogs).filter((log) => log.isValidDay).length;
  const hasSpend = state.savings.history.some((item) => item.type === 'spent');

  const shouldUnlock: Record<string, boolean> = {
    first_valid: validCount >= 1,
    streak_3: streak >= 3,
    streak_7: streak >= 7,
    streak_14: streak >= 14,
    streak_30: streak >= 30,
    best_streak_7: historic >= 7,
    saved_2k: state.savings.totalSaved >= 2000,
    saved_10k: state.savings.totalSaved >= 10000,
    week_5: weekValid >= 5,
    first_spend: hasSpend,
  };

  return state.achievements.map((item) => {
    if (item.unlockedAt || !shouldUnlock[item.id]) return item;
    return { ...item, unlockedAt: now };
  });
}

const initialSlice = {
  hasOnboarded: false,
  profile: null as UserProfile | null,
  foodEntries: [] as FoodEntry[],
  exerciseEntries: [] as ExerciseEntry[],
  dailyLogs: {} as Record<string, DailyLog>,
  savings: emptySavings(),
  achievements: seedAchievements(),
  catalog: [] as CatalogFood[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...initialSlice,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      completeOnboarding: (profile) => {
        set({
          hasOnboarded: true,
          profile,
          achievements: seedAchievements(),
        });
        const computed = recomputeDate(get(), todayKey());
        set(computed);
      },
      updateProfile: (patch) => {
        const current = get().profile;
        if (!current) return;
        const merged = { ...current, ...patch };
        const metrics = rebuildProfileMetrics(merged);
        const profile = { ...merged, ...metrics };
        const next = { ...get(), profile };
        const dates = new Set([
          ...Object.keys(next.dailyLogs),
          ...next.foodEntries.map((item) => item.date),
          ...next.exerciseEntries.map((item) => item.date),
          todayKey(),
        ]);
        let dailyLogs = next.dailyLogs;
        let savings = next.savings;
        dates.forEach((date) => {
          const computed = recomputeDate({ ...next, dailyLogs, savings, profile }, date);
          dailyLogs = computed.dailyLogs;
          savings = computed.savings;
        });
        const withLogs = { ...next, profile, dailyLogs, savings };
        set({
          profile,
          dailyLogs,
          savings,
          achievements: unlockAchievements(withLogs as AppState),
        });
      },
      addFood: (input) => {
        const date = input.date ?? todayKey();
        const entry: FoodEntry = {
          ...input,
          id: createId(),
          date,
          name: input.name.trim(),
          calories: Math.max(0, Math.round(input.calories)),
        };
        const foodEntries = [entry, ...get().foodEntries];
        const catalog = upsertCatalog(get().catalog, entry);
        const computed = recomputeDate({ ...get(), foodEntries }, date);
        const next = { ...get(), foodEntries, catalog, ...computed };
        set({
          foodEntries,
          catalog,
          ...computed,
          achievements: unlockAchievements(next as AppState),
        });
      },
      updateFood: (id, patch) => {
        const target = get().foodEntries.find((item) => item.id === id);
        if (!target) return;
        const foodEntries = get().foodEntries.map((item) =>
          item.id === id
            ? {
                ...item,
                name: patch.name !== undefined ? patch.name.trim() : item.name,
                calories:
                  patch.calories !== undefined
                    ? Math.max(0, Math.round(patch.calories))
                    : item.calories,
              }
            : item,
        );
        const computed = recomputeDate({ ...get(), foodEntries }, target.date);
        set({ foodEntries, ...computed });
      },
      removeFood: (id) => {
        const target = get().foodEntries.find((item) => item.id === id);
        const foodEntries = get().foodEntries.filter((item) => item.id !== id);
        if (!target) return;
        const computed = recomputeDate({ ...get(), foodEntries }, target.date);
        set({ foodEntries, ...computed });
      },
      toggleFavorite: (name) => {
        const key = name.trim().toLowerCase();
        set({
          catalog: get().catalog.map((item) =>
            item.name.trim().toLowerCase() === key
              ? { ...item, isFavorite: !item.isFavorite }
              : item,
          ),
        });
      },
      addExercise: (input) => {
        const profile = get().profile;
        if (!profile) return;
        const date = input.date ?? todayKey();
        const existingRaw = get()
          .exerciseEntries.filter((item) => item.date === date)
          .reduce((sum, item) => sum + item.caloriesCredit, 0);
        const remaining =
          capExerciseCredit(existingRaw + input.caloriesCredit, profile.dailyGoal) - existingRaw;
        const credited = Math.max(0, Math.round(remaining));
        const entry: ExerciseEntry = {
          id: createId(),
          date,
          type: input.type,
          durationMinutes: input.durationMinutes,
          caloriesCredit: credited,
        };
        const exerciseEntries = [entry, ...get().exerciseEntries];
        const computed = recomputeDate({ ...get(), exerciseEntries }, date);
        const next = { ...get(), exerciseEntries, ...computed };
        set({
          exerciseEntries,
          ...computed,
          achievements: unlockAchievements(next as AppState),
        });
      },
      updateExercise: (id, patch) => {
        const profile = get().profile;
        const target = get().exerciseEntries.find((item) => item.id === id);
        if (!profile || !target) return;
        const nextType = patch.type?.trim() || target.type;
        const nextDuration = patch.durationMinutes ?? target.durationMinutes;
        const option = ACTIVITY_OPTIONS.find((item) => item.name === nextType);
        const rawEstimate = option
          ? estimateActivityCalories(option.met, profile.weightKg, nextDuration)
          : target.durationMinutes > 0
            ? Math.round(target.caloriesCredit * (nextDuration / target.durationMinutes))
            : target.caloriesCredit;
        const othersRaw = get()
          .exerciseEntries.filter((item) => item.date === target.date && item.id !== id)
          .reduce((sum, item) => sum + item.caloriesCredit, 0);
        const remaining =
          capExerciseCredit(othersRaw + rawEstimate, profile.dailyGoal) - othersRaw;
        const caloriesCredit = Math.max(0, Math.round(remaining));
        const exerciseEntries = get().exerciseEntries.map((item) =>
          item.id === id
            ? {
                ...item,
                type: nextType,
                durationMinutes: Math.max(1, Math.round(nextDuration)),
                caloriesCredit,
              }
            : item,
        );
        const computed = recomputeDate({ ...get(), exerciseEntries }, target.date);
        set({ exerciseEntries, ...computed });
      },
      removeExercise: (id) => {
        const target = get().exerciseEntries.find((item) => item.id === id);
        const exerciseEntries = get().exerciseEntries.filter((item) => item.id !== id);
        if (!target) return;
        const computed = recomputeDate({ ...get(), exerciseEntries }, target.date);
        set({ exerciseEntries, ...computed });
      },
      spendSavings: (amount, note) => {
        const rounded = Math.round(amount);
        if (!Number.isFinite(rounded) || rounded <= 0) {
          return { ok: false, message: 'Indicá un monto mayor a 0.' };
        }
        if (rounded > get().savings.totalSaved) {
          return { ok: false, message: 'Ese gasto supera el saldo disponible.' };
        }
        const movement = {
          id: createId(),
          date: todayKey(),
          amount: rounded,
          type: 'spent' as const,
          note: note.trim() || 'Salida puntual',
        };
        const savings: SavingsBalance = {
          totalSaved: get().savings.totalSaved - rounded,
          history: [movement, ...get().savings.history],
        };
        const next = { ...get(), savings };
        set({
          savings,
          achievements: unlockAchievements(next as AppState),
        });
        return { ok: true, message: 'Listo, el saldo ya está actualizado.' };
      },
      resetAll: () => {
        set({ ...initialSlice, achievements: seedAchievements() });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        profile: state.profile,
        foodEntries: state.foodEntries,
        exerciseEntries: state.exerciseEntries,
        dailyLogs: state.dailyLogs,
        savings: state.savings,
        achievements: state.achievements,
        catalog: state.catalog,
      }),
      skipHydration: false,
    },
  ),
);

export function selectTodayLog(state: AppState): DailyLog | null {
  if (!state.profile) return null;
  const date = todayKey();
  return (
    state.dailyLogs[date] ??
    computeDailyLog({
      date,
      goalType: state.profile.goalType,
      dailyGoal: state.profile.dailyGoal,
      healthyRangeMin: state.profile.healthyRangeMin,
      healthyRangeMax: state.profile.healthyRangeMax,
      totalConsumed: 0,
      rawExerciseCredit: 0,
    })
  );
}

export function selectTodayFood(state: AppState): FoodEntry[] {
  const date = todayKey();
  return state.foodEntries.filter((item) => item.date === date);
}

export function selectTodayExercise(state: AppState): ExerciseEntry[] {
  const date = todayKey();
  return state.exerciseEntries.filter((item) => item.date === date);
}
