import type { ActivityLevel, GoalType, Sex } from './types';

export const SEX_OPTIONS: { value: Sex; label: string; help: string }[] = [
  { value: 'female', label: 'Mujer', help: 'Usa la constante femenina de Mifflin-St Jeor.' },
  { value: 'male', label: 'Hombre', help: 'Usa la constante masculina de Mifflin-St Jeor.' },
  { value: 'other', label: 'Otro / prefiero no decir', help: 'Usa un punto medio entre ambas fórmulas.' },
];

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string; help: string }[] = [
  { value: 'sedentary', label: 'Sedentario', help: 'Mayormente sentado, poco movimiento extra.' },
  { value: 'light', label: 'Ligero', help: 'Caminás o te movés 1–3 días por semana.' },
  { value: 'moderate', label: 'Moderado', help: 'Actividad 3–5 días por semana.' },
  { value: 'active', label: 'Activo', help: 'Entrenás o tenés un trabajo muy físico casi todos los días.' },
];

export const GOAL_OPTIONS: { value: GoalType; label: string; help: string }[] = [
  {
    value: 'lose',
    label: 'Bajar de peso',
    help: 'Tu presupuesto diario queda por debajo de tu gasto estimado, sin salir del rango seguro.',
  },
  {
    value: 'maintain',
    label: 'Mantener',
    help: 'Tu presupuesto se acerca a tu gasto diario estimado.',
  },
  {
    value: 'gain',
    label: 'Subir de peso',
    help: 'Tu presupuesto queda por encima del gasto estimado, con un tope de seguridad.',
  },
];

export const PORTION_HINTS = [
  'Una porción de arroz o pasta cocida ≈ un puño cerrado (~180–220 kcal).',
  'Una cucharada de aceite ≈ la yema del pulgar (~120 kcal).',
  'Una pechuga de pollo del tamaño de la palma ≈ 150–180 kcal.',
];

export const SATIETY_TIPS = [
  'Un vaso de agua antes de sentarte a comer ayuda a registrar el hambre real.',
  'Alimentos con fibra (verduras, legumbres, avena) suelen rendir más saciedad por caloría.',
  'Una porción de proteína en el plato suele hacer que el presupuesto rinda más horas.',
  'Comer despacio le da tiempo al cuerpo a registrar que ya hay comida.',
  'Empezar el plato por las verduras deja menos espacio para el resto, sin recortar de golpe.',
  'Si tenés sed, a veces se siente parecido al hambre: un vaso de agua es un buen primer paso.',
  'Masticar bien y dejar el cubierto entre bocados estira la comida sin sumar calorías.',
  'Un plato más chico hace que la misma porción se vea completa, y es más fácil de registrar.',
];
