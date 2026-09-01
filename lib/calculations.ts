import type { ActivityLevel, DailyLog, GoalType, Sex } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const SAVE_CAP_RATIO = 0.2;
export const EXERCISE_CREDIT_CAP_RATIO = 0.3;

/** Absolute safety floors (kcal): 1500 male, 1200 female, 1300 other. */
export function calorieFloor(sex: Sex): number {
  if (sex === 'male') return 1500;
  if (sex === 'female') return 1200;
  return 1300;
}

/** Mifflin-St Jeor BMR. For sex "other", uses the midpoint of male/female constants. */
export function mifflinStJeorBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') return base + 5;
  if (sex === 'female') return base - 161;
  return base - 78;
}

export function calculateTdee(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel,
): number {
  const bmr = mifflinStJeorBmr(weightKg, heightCm, age, sex);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Safety band around TDEE.
 * Min never exceeds TDEE (so lose/maintain always has a valid goal range).
 * If TDEE is below the sex-based floor, min equals TDEE rather than forcing an empty range.
 * Max is TDEE + 500 (typical surplus cap used in clinical nutrition guidance).
 */
export function calculateHealthyRange(
  tdee: number,
  sex: Sex,
): { min: number; max: number } {
  const floor = calorieFloor(sex);
  const min = Math.round(Math.min(tdee, Math.max(floor, tdee - 500)));
  const max = Math.round(tdee + 500);
  return { min, max };
}

export function dailyGoalBounds(
  goalType: GoalType,
  tdee: number,
  healthyRangeMin: number,
  healthyRangeMax: number,
): { min: number; max: number } {
  if (goalType === 'gain') {
    return { min: tdee, max: healthyRangeMax };
  }
  return { min: healthyRangeMin, max: tdee };
}

export function clampDailyGoal(value: number, min: number, max: number): number {
  if (min > max) return Math.round(max);
  return Math.round(Math.min(max, Math.max(min, value)));
}

export function suggestedDailyGoal(
  goalType: GoalType,
  tdee: number,
  healthyRangeMin: number,
  healthyRangeMax: number,
): number {
  const { min, max } = dailyGoalBounds(goalType, tdee, healthyRangeMin, healthyRangeMax);
  if (goalType === 'lose') return clampDailyGoal(tdee - 400, min, max);
  if (goalType === 'gain') return clampDailyGoal(tdee + 300, min, max);
  return clampDailyGoal(tdee, min, max);
}

export function capExerciseCredit(rawCredit: number, dailyGoal: number): number {
  const cap = dailyGoal * EXERCISE_CREDIT_CAP_RATIO;
  return Math.round(Math.min(Math.max(0, rawCredit), cap));
}

export function dailySaveCap(dailyGoal: number): number {
  return Math.round(dailyGoal * SAVE_CAP_RATIO);
}

export function computeDailyLog(params: {
  date: string;
  goalType: GoalType;
  dailyGoal: number;
  healthyRangeMin: number;
  healthyRangeMax: number;
  totalConsumed: number;
  rawExerciseCredit: number;
}): DailyLog {
  const {
    date,
    goalType,
    dailyGoal,
    healthyRangeMin,
    healthyRangeMax,
    totalConsumed,
    rawExerciseCredit,
  } = params;

  const exerciseCredit = capExerciseCredit(rawExerciseCredit, dailyGoal);
  const saveCap = dailySaveCap(dailyGoal);
  const consumed = Math.max(0, totalConsumed);

  let isValidDay = false;
  let saved = 0;

  if (goalType === 'gain') {
    isValidDay = consumed >= dailyGoal && consumed <= healthyRangeMax;
    if (isValidDay) {
      saved = Math.min(consumed - dailyGoal, saveCap);
    }
  } else {
    const ceiling = dailyGoal + exerciseCredit;
    isValidDay = consumed >= healthyRangeMin && consumed <= ceiling;
    if (isValidDay) {
      saved = Math.min(Math.max(0, dailyGoal - consumed), saveCap);
    }
  }

  return {
    date,
    totalConsumed: consumed,
    exerciseCredit,
    goal: dailyGoal,
    saved: Math.round(saved),
    isValidDay,
  };
}

export function rebuildProfileMetrics(
  profile: {
    age: number;
    weightKg: number;
    heightCm: number;
    sex: Sex;
    activityLevel: ActivityLevel;
    goalType: GoalType;
    dailyGoal: number;
    mode: 'normal' | 'tryhard';
    activityPreference: 'low_impact' | 'intense';
  },
) {
  const tdee = calculateTdee(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.sex,
    profile.activityLevel,
  );
  const { min: healthyRangeMin, max: healthyRangeMax } = calculateHealthyRange(
    tdee,
    profile.sex,
  );
  const bounds = dailyGoalBounds(
    profile.goalType,
    tdee,
    healthyRangeMin,
    healthyRangeMax,
  );
  const dailyGoal = clampDailyGoal(profile.dailyGoal, bounds.min, bounds.max);
  return { tdee, healthyRangeMin, healthyRangeMax, dailyGoal };
}
