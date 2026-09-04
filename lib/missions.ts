import type { DailyLog, ExerciseEntry, FoodEntry, GoalType } from './types';

export type MissionKind = 'food' | 'move' | 'range';

export interface DailyMission {
  id: string;
  title: string;
  detail: string;
  cta: string;
  href: '/food' | '/activity';
  kind: MissionKind;
  icon: 'leaf' | 'walk' | 'restaurant' | 'flame';
}

const VEG =
  /ensalada|verdura|vegetal|brocoli|brócoli|espinaca|zucchini|zapallito|zanahoria|tomate|lechuga|pepino|coliflor|kale|rúcula|rucula|chaucha|acelga|repollo|berenjena|pimiento|morrón|morron/;
const PROTEIN =
  /pollo|carne|pescado|atún|atun|huevo|tofu|lenteja|garbanzo|poroto|yogur|yogurt|queso|pavo|merluza|salmón|salmon/;
const FRUIT = /manzana|banana|naranja|frutilla|fruta|pera|kiwi|arandano|arándano|mandarina/;
const WALK = /camin|paseo|walk/;
const MOVE = /camin|yoga|bici|nataci|estir|corr|hiit|pesas|boxeo|fuerza|remo|el[ií]ptica/;

const SHARED: DailyMission[] = [
  {
    id: 'veg',
    title: 'Sumá verduras al plato',
    detail: 'Registrá una comida con ensalada, verdura o vegetales.',
    cta: 'Registrar comida',
    href: '/food',
    kind: 'food',
    icon: 'leaf',
  },
  {
    id: 'walk',
    title: 'Caminá 15 minutos',
    detail: 'Una caminata corta cuenta. Registrala cuando la hagas.',
    cta: 'Registrar actividad',
    href: '/activity',
    kind: 'move',
    icon: 'walk',
  },
  {
    id: 'protein',
    title: 'Incluí proteína',
    detail: 'Huevo, yogur, legumbres, pollo o pescado: anotalo en el día.',
    cta: 'Registrar comida',
    href: '/food',
    kind: 'food',
    icon: 'restaurant',
  },
  {
    id: 'fruit',
    title: 'Una fruta en el día',
    detail: 'Manzana, banana u otra fruta. Cargala como comida.',
    cta: 'Registrar comida',
    href: '/food',
    kind: 'food',
    icon: 'leaf',
  },
  {
    id: 'move',
    title: 'Movete un rato',
    detail: 'Cualquier actividad registrada completa esta misión.',
    cta: 'Registrar actividad',
    href: '/activity',
    kind: 'move',
    icon: 'walk',
  },
  {
    id: 'meals',
    title: 'Registrá tres comidas',
    detail: 'Desayuno, almuerzo y cena (o lo que armes). Tres entradas alcanzan.',
    cta: 'Registrar comida',
    href: '/food',
    kind: 'food',
    icon: 'restaurant',
  },
  {
    id: 'range',
    title: 'Cerrá el día en rango',
    detail: 'Quedate dentro del presupuesto. Mañana la racha suma.',
    cta: 'Ver comidas',
    href: '/food',
    kind: 'range',
    icon: 'flame',
  },
];

function hashKey(key: string): number {
  return key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function missionForDay(date: string, goalType: GoalType): DailyMission {
  const pool =
    goalType === 'gain'
      ? SHARED.filter((item) => item.id !== 'veg')
      : SHARED;
  return pool[hashKey(date) % pool.length] ?? SHARED[0]!;
}

export function isMissionComplete(
  mission: DailyMission,
  foods: FoodEntry[],
  exercises: ExerciseEntry[],
  log: DailyLog | null,
): boolean {
  if (mission.id === 'veg') return foods.some((item) => VEG.test(item.name.toLowerCase()));
  if (mission.id === 'protein') return foods.some((item) => PROTEIN.test(item.name.toLowerCase()));
  if (mission.id === 'fruit') return foods.some((item) => FRUIT.test(item.name.toLowerCase()));
  if (mission.id === 'meals') return foods.length >= 3;
  if (mission.id === 'walk') {
    return exercises.some(
      (item) => WALK.test(item.type.toLowerCase()) && item.durationMinutes >= 15,
    );
  }
  if (mission.id === 'move') {
    return exercises.some((item) => MOVE.test(item.type.toLowerCase()) || item.durationMinutes >= 10);
  }
  if (mission.id === 'range') return !!log?.isValidDay;
  return false;
}
