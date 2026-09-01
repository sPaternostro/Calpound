import type { Achievement } from './types';

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_valid',
    title: 'Primer día en rango',
    description: 'Cerraste un día dentro de tu presupuesto saludable.',
    type: 'consistency',
  },
  {
    id: 'streak_3',
    title: 'Racha de 3',
    description: 'Tres días seguidos dentro del rango.',
    type: 'streak',
  },
  {
    id: 'streak_7',
    title: 'Semana completa',
    description: 'Siete días consecutivos en rango.',
    type: 'streak',
  },
  {
    id: 'streak_14',
    title: 'Quincena constante',
    description: 'Catorce días seguidos cuidando el presupuesto.',
    type: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Mes en marcha',
    description: 'Treinta días consecutivos dentro del rango.',
    type: 'streak',
  },
  {
    id: 'best_streak_7',
    title: 'Mejor racha ×7',
    description: 'Tu mejor racha histórica llegó a 7 días.',
    type: 'streak',
  },
  {
    id: 'saved_2k',
    title: 'Saldo 2.000',
    description: 'Acumulaste 2.000 kcal en el banco.',
    type: 'milestone',
  },
  {
    id: 'saved_10k',
    title: 'Saldo 10.000',
    description: 'Llegaste a 10.000 kcal ahorradas.',
    type: 'milestone',
  },
  {
    id: 'week_5',
    title: 'Semana sólida',
    description: 'Cinco días válidos en una misma semana.',
    type: 'consistency',
  },
  {
    id: 'first_spend',
    title: 'Primera salida',
    description: 'Usaste parte del saldo en algo puntual.',
    type: 'milestone',
  },
];

export function seedAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFS.map((item) => ({ ...item, unlockedAt: null }));
}
