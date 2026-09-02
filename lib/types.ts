export type GoalType = 'lose' | 'maintain' | 'gain';
export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type AppMode = 'normal' | 'tryhard';
export type ActivityPreference = 'low_impact' | 'intense';
export type FoodSource = 'search' | 'barcode' | 'manual';
export type MovementType = 'earned' | 'spent';
export type AchievementType = 'streak' | 'milestone' | 'consistency';

export interface GuiltFreeFood {
  name: string;
  calories: number;
}

export interface UserProfile {
  name?: string;
  age: number;
  weightKg: number;
  heightCm: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  tdee: number;
  healthyRangeMin: number;
  healthyRangeMax: number;
  dailyGoal: number;
  mode: AppMode;
  activityPreference: ActivityPreference;
  guiltFreeFoods?: GuiltFreeFood[];
}

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  source: FoodSource;
  isFavorite?: boolean;
  barcode?: string;
  servingLabel?: string;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  caloriesCredit: number;
}

export interface DailyLog {
  date: string;
  totalConsumed: number;
  exerciseCredit: number;
  goal: number;
  saved: number;
  isValidDay: boolean;
}

export interface SavingsMovement {
  id: string;
  date: string;
  amount: number;
  type: MovementType;
  note?: string;
}

export interface SavingsBalance {
  totalSaved: number;
  history: SavingsMovement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
  type: AchievementType;
}

export interface CatalogFood {
  name: string;
  calories: number;
  source: FoodSource;
  barcode?: string;
  servingLabel?: string;
  lastUsedAt: string;
  isFavorite: boolean;
}
