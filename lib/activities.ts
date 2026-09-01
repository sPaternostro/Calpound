import type { ActivityPreference } from './types';

export interface ActivityOption {
  id: string;
  name: string;
  preference: ActivityPreference;
  met: number;
  hint: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    id: 'walk',
    name: 'Caminar',
    preference: 'low_impact',
    met: 3.5,
    hint: 'Ritmo cómodo, conversación fácil.',
  },
  {
    id: 'yoga',
    name: 'Yoga o movilidad',
    preference: 'low_impact',
    met: 2.5,
    hint: 'Estirar, respirar, mover articulaciones.',
  },
  {
    id: 'pilates',
    name: 'Pilates',
    preference: 'low_impact',
    met: 3.0,
    hint: 'Control y core, sin impacto.',
  },
  {
    id: 'cycle_easy',
    name: 'Bici suave',
    preference: 'low_impact',
    met: 4.0,
    hint: 'Paseo o bici estática sin fatiga.',
  },
  {
    id: 'swim_easy',
    name: 'Natación suave',
    preference: 'low_impact',
    met: 5.0,
    hint: 'Largos tranquilos o aqua-gym ligero.',
  },
  {
    id: 'stretch',
    name: 'Estiramientos',
    preference: 'low_impact',
    met: 2.3,
    hint: 'Ideal para días de recuperación.',
  },
  {
    id: 'run',
    name: 'Correr',
    preference: 'intense',
    met: 8.0,
    hint: 'Trote o intervalos, según tu ritmo.',
  },
  {
    id: 'hiit',
    name: 'HIIT',
    preference: 'intense',
    met: 8.5,
    hint: 'Bloques cortos de alta demanda.',
  },
  {
    id: 'weights',
    name: 'Fuerza con pesas',
    preference: 'intense',
    met: 6.0,
    hint: 'Series de resistencia con esfuerzo notable.',
  },
  {
    id: 'box',
    name: 'Boxeo o combate',
    preference: 'intense',
    met: 7.8,
    hint: 'Sombra, bolsa o sparring técnico.',
  },
  {
    id: 'cycle_hard',
    name: 'Bici intensa',
    preference: 'intense',
    met: 8.0,
    hint: 'Cuestas, potencia o spinning fuerte.',
  },
  {
    id: 'swim_laps',
    name: 'Natación de series',
    preference: 'intense',
    met: 9.5,
    hint: 'Largos con ritmo sostenido.',
  },
];

export function activitiesFor(preference: ActivityPreference): ActivityOption[] {
  return ACTIVITY_OPTIONS.filter((item) => item.preference === preference);
}

/** Standard MET formula: kcal ≈ MET × kg × hours. */
export function estimateActivityCalories(
  met: number,
  weightKg: number,
  durationMinutes: number,
): number {
  return Math.round(met * weightKg * (durationMinutes / 60));
}
