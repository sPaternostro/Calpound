import type { DailyLog } from './types';
import { addDays, startOfWeek, todayKey } from './dates';

export function currentStreak(logs: Record<string, DailyLog>, today = todayKey()): number {
  let streak = 0;
  let cursor = today;
  if (!logs[cursor]?.isValidDay) {
    cursor = addDays(today, -1);
  }
  while (logs[cursor]?.isValidDay) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(logs: Record<string, DailyLog>): number {
  const keys = Object.keys(logs).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of keys) {
    if (!logs[key]?.isValidDay) {
      run = 0;
      prev = key;
      continue;
    }
    if (prev && addDays(prev, 1) === key) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

export function validDaysInWeek(logs: Record<string, DailyLog>, anchor: string): number {
  const start = startOfWeek(anchor);
  let count = 0;
  for (let i = 0; i < 7; i += 1) {
    const key = addDays(start, i);
    if (logs[key]?.isValidDay) count += 1;
  }
  return count;
}
