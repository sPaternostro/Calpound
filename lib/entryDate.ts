import { useLocalSearchParams } from 'expo-router';

import { todayKey } from './dates';

export function useEntryDate(): string {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const raw = Array.isArray(params.date) ? params.date[0] : params.date;
  const today = todayKey();
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) && raw <= today) return raw;
  return today;
}
