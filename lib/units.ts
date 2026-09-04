import type { UnitSystem } from './types';

export function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return value;
}

export function kgToLb(kg: number): number {
  return kg * 2.2046226218;
}

export function lbToKg(lb: number): number {
  return lb / 2.2046226218;
}

export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const total = Math.round(cmToInches(cm));
  let feet = Math.floor(total / 12);
  let inches = total - feet * 12;
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return inchesToCm(feet * 12 + inches);
}

export function formatWeight(kg: number, system: UnitSystem): string {
  if (system === 'imperial') {
    return (Math.round(kgToLb(kg) * 10) / 10).toLocaleString('es-AR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    });
  }
  return (Math.round(kg * 10) / 10).toLocaleString('es-AR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

export function formatHeightCm(cm: number): string {
  return String(Math.round(cm));
}

export function isValidMetricBody(weightKg: number, heightCm: number): boolean {
  return weightKg >= 30 && weightKg <= 250 && heightCm >= 120 && heightCm <= 230;
}
