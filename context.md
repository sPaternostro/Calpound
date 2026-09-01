# Calpound — Spec final + Prompt para Cursor

## 1. Concepto
App de seguimiento calórico con mecánica de "ahorro" tipo finanzas personales (Calpound = Calorías + Compound interest). El usuario define un objetivo diario según su meta (bajar, mantener o subir de peso), y cada día que se mantiene dentro de un rango saludable "ahorra" o "suma" hacia un balance acumulado que después puede "gastar" en algo puntual. Diseño moderno, limpio, con ayuda contextual en cada pantalla para gente que no tiene idea de nutrición.

## 2. Principios de diseño (no negociables en la lógica)

1. **Rango saludable siempre presente**: en el onboarding se calcula un TDEE (Mifflin-St Jeor: edad, peso, altura, sexo, actividad) y a partir de ahí un `healthyRangeMin` y `healthyRangeMax` — límites de seguridad que la app nunca deja cruzar al configurar el objetivo diario, sin importar el tipo de meta.
2. **Modelo simétrico bajar / mantener / subir**:
   - Meta "bajar" o "mantener": el objetivo diario (`dailyGoal`) debe estar entre `healthyRangeMin` y el TDEE. El día es válido si `consumido` está entre `healthyRangeMin` y `dailyGoal`. El ahorro = `dailyGoal - consumido`.
   - Meta "subir": el objetivo diario debe estar entre el TDEE y `healthyRangeMax`. El día es válido si `consumido` está entre `dailyGoal` y `healthyRangeMax`. El ahorro = `consumido - dailyGoal`.
   - En ambos casos, el ahorro diario tiene un tope (ej. 20% del `dailyGoal`) para que no se pueda acumular todo de golpe.
3. **Ejercicio suma margen, sin marco de "compensación"**: registrar actividad física (manual: tipo + duración, o directamente calorías estimadas) suma crédito al presupuesto del día. Esta opción está **siempre visible en Home**, no aparece como sugerencia condicionada a "ya comiste de más" — eso sería reforzar un patrón de ejercicio compensatorio, que específicamente queremos evitar. El crédito por ejercicio también tiene un tope (ej. no puede superar el 30% del `dailyGoal`).
4. **Sin ramificación por tipo de cuerpo**: nada de recomendaciones de intensidad basadas en inferir la contextura del usuario. En vez de eso, un toggle simple en el perfil: "prefiero actividades de bajo impacto" / "prefiero actividades intensas" — lo elige la persona, no un algoritmo.
5. **Tono neutro-positivo, nunca punitivo**: lenguaje de presupuesto ("usaste todo tu presupuesto de hoy"), nunca de culpa ("te excediste", "fallaste").
6. **Disclaimer en onboarding**: aclarar que la app no reemplaza asesoramiento nutricional profesional.
7. **Ayuda contextual en toda la app**: cada input/formulario tiene texto de ayuda breve (ej. en el campo de calorías: "no sabés cuánto tiene? buscalo en la base de datos o escaneá el código de barras").

## 3. Modos
- **Modo Normal**: dashboard simple, streak visible, sin mucha fricción.
- **Modo Tryhard**: más énfasis visual en streaks, comparación con tu mejor racha histórica, logros más presentes. Sigue siendo individual, sin funciones sociales todavía.
(Nota: pensar el nombre "Tryhard" — puede sonar demasiado gamer/informal para algunos usuarios; alternativa: "Modo Competitivo" o "Modo Foco". Definilo vos, es solo copy.)

## 4. Logging de comida (resuelto)
- **Búsqueda manual con autocompletado** contra la API pública y gratuita de **OpenFoodFacts** (`https://world.openfoodfacts.org/api/v2`, sin necesidad de API key) — el usuario escribe el nombre del alimento y elige de una lista con calorías ya cargadas.
- **Escaneo de código de barras** con la cámara (usando `expo-camera`, que ya incluye escaneo de barcodes) contra el mismo endpoint de OpenFoodFacts por GTIN — ideal para productos envasados.
- **Favoritos y "recientes"**: después de loguear algo una vez, queda accesible con un toque, para bajar la fricción con el tiempo.
- **Ayuda visual de porciones** en el formulario de carga manual (para cuando no está en la base de datos): referencias simples tipo "una porción de arroz cocido ≈ un puño cerrado", "una cucharada de aceite ≈ 120 kcal", etc. — un par de ejemplos comunes, no hace falta una guía exhaustiva en el MVP.
- Todo esto es 100% local, sin backend — OpenFoodFacts es una API pública que se puede llamar directo desde el cliente.

## 5. Stack técnico
- **Expo (managed) + TypeScript**
- **Expo Router** (navegación por archivos)
- **Zustand** (estado global)
- **AsyncStorage** (persistencia local, sin backend)
- **NativeWind** (Tailwind para RN, para que el diseño sea rápido de iterar y moderno)
- **expo-camera** (escaneo de código de barras)
- Fetch directo a la API de OpenFoodFacts (REST, sin autenticación)

## 6. Modelo de datos

```typescript
type GoalType = 'lose' | 'maintain' | 'gain';

interface UserProfile {
  age: number;
  weightKg: number;
  heightCm: number;
  sex: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  goalType: GoalType;
  tdee: number;
  healthyRangeMin: number;
  healthyRangeMax: number;
  dailyGoal: number; // validado contra el rango según goalType
  mode: 'normal' | 'tryhard';
  activityPreference: 'low_impact' | 'intense';
}

interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  source: 'search' | 'barcode' | 'manual';
  isFavorite?: boolean;
}

interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  caloriesCredit: number; // topeado
}

interface DailyLog {
  date: string;
  totalConsumed: number;
  exerciseCredit: number;
  goal: number;
  saved: number; // con signo según goalType, topeado
  isValidDay: boolean;
}

interface SavingsBalance {
  totalSaved: number;
  history: { date: string; amount: number; type: 'earned' | 'spent'; note?: string }[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
  type: 'streak' | 'milestone' | 'consistency';
}
```

## 7. Pantallas
1. **Onboarding**: perfil → cálculo de TDEE y rango saludable → selección de tipo de meta (bajar/mantener/subir) → objetivo diario (validado) → preferencia de actividad → disclaimer.
2. **Home**: progreso del día (barra de presupuesto, adaptada según goalType), balance acumulado, streak, botones de "Registrar comida" y "Registrar actividad" siempre visibles.
3. **Registrar comida**: tabs de Buscar / Escanear código / Manual, con favoritos y recientes arriba.
4. **Registrar actividad**: tipo + duración (lista simple de actividades comunes, con nota de baja/alta intensidad según preferencia del usuario).
5. **Banco**: balance, botón "Gastar" (nota + cantidad), historial de movimientos.
6. **Historial**: calendario/semana con días válidos y ahorro por día.
7. **Logros**: grilla de streaks y consistencia.
8. **Configuración**: editar perfil/meta (con validación de rango siempre activa), cambiar Modo Normal/Tryhard, preferencia de actividad, reset de datos.

## 8. Fuera de scope (MVP)
Backend/login, funciones sociales, reconocimiento de comida por foto con IA (queda para v2), notificaciones push.

---

## 9. Antes de arrancar en Cursor — tips para tu primera vez
- Creá una carpeta nueva, abrila en Cursor, e inicializá git (`git init`) antes de pedirle nada al agente — así podés revertir si algo sale mal.
- Guardá este archivo (o el prompt de abajo) como `CONTEXT.md` en la raíz del proyecto y decile a Cursor al principio de la conversación "leé CONTEXT.md antes de empezar" — los agentes tienden a "olvidar" contexto de mensajes muy viejos en sesiones largas, tener el archivo en el repo ayuda a que lo pueda releer.
- Usá el modo **Agent/Composer** de Cursor (no el chat normal) para tareas que tocan varios archivos — es el que puede crear/editar archivos directamente.
- Pedile las cosas **de a partes**: primero setup + modelo de datos, después Onboarding, después Home, etc. — no tires las 8 pantallas en un solo pedido, los resultados son mejores y podés revisar cada diff antes de aceptar.
- Revisá los cambios que propone antes de aceptarlos (Cursor te muestra el diff) — no hace falta que entiendas cada línea, pero sí que corras la app seguido para ver que ande.
- Para probar en tu celular: `npx expo start`, te tira un QR, lo escaneás con la app **Expo Go** (Android) o la cámara (iOS) y corre ahí directo, sin compilar nada nativo.

## 10. PROMPT PARA PEGAR EN CURSOR

```
Quiero que crees una app en React Native (Expo, managed workflow) + TypeScript llamada "Calpound".

CONCEPTO: App de seguimiento calórico con mecánica de "ahorro" tipo finanzas personales. El usuario define una meta (bajar, mantener o subir de peso) y un objetivo diario de calorías. Cada día que se mantiene dentro de un rango saludable, "ahorra" (o "suma", si su meta es subir de peso) hacia un balance acumulado que puede "gastar" después en algo puntual. Diseño moderno, limpio, con textos de ayuda contextual en cada formulario.

REGLAS DE NEGOCIO OBLIGATORIAS:
1. Onboarding calcula TDEE con Mifflin-St Jeor (edad, peso kg, altura cm, sexo, nivel de actividad). A partir del TDEE calculá healthyRangeMin y healthyRangeMax (límites de seguridad estándar de nutrición, nunca por debajo de 1200-1500 kcal según perfil).
2. El usuario elige goalType: 'lose', 'maintain' o 'gain'.
   - Si es 'lose' o 'maintain': dailyGoal debe estar entre healthyRangeMin y el TDEE. Día válido si consumido está entre healthyRangeMin y dailyGoal. saved = dailyGoal - consumido.
   - Si es 'gain': dailyGoal debe estar entre el TDEE y healthyRangeMax. Día válido si consumido está entre dailyGoal y healthyRangeMax. saved = consumido - dailyGoal.
   - En ambos casos, saved diario tiene un tope de 20% de dailyGoal.
   - La UI debe bloquear cualquier intento de configurar dailyGoal fuera del rango correspondiente.
3. Registrar actividad física (tipo + duración) suma un crédito al presupuesto del día (caloriesCredit), topeado a 30% del dailyGoal. Esta opción está SIEMPRE visible y accesible en Home, nunca condicionada a "ya te pasaste de calorías hoy" — no debe sentirse como una sugerencia de compensación por haber comido de más.
4. No ramifiques recomendaciones de intensidad de actividad según peso/altura/BMI del usuario. En vez de eso, el usuario elige en su perfil una preferencia simple: 'low_impact' o 'intense', y las actividades sugeridas se filtran según esa preferencia elegida por él.
5. Todo el copy debe ser neutro-positivo, estilo presupuesto financiero, nunca punitivo (nada de "te excediste", "fallaste").
6. Incluir un disclaimer breve en el onboarding: la app no reemplaza asesoramiento nutricional profesional.
7. Cada formulario debe incluir texto de ayuda contextual breve para usuarios sin conocimientos de nutrición (ej: en el campo de calorías manual, un texto tipo "¿no sabés cuánto tiene? probá buscarlo o escanear el código de barras").

LOGGING DE COMIDA:
- Búsqueda con autocompletado contra la API pública de OpenFoodFacts (https://world.openfoodfacts.org/api/v2, sin API key) por nombre de producto.
- Escaneo de código de barras con expo-camera, consultando el mismo endpoint por GTIN.
- Favoritos y "recientes" para acceso rápido a alimentos ya cargados antes.
- Carga manual (nombre + calorías) como alternativa si no se encuentra en la base de datos, con un par de referencias de tamaño de porción como ayuda (ej. "una porción de arroz cocido ≈ un puño cerrado").

MODOS: 'normal' (dashboard simple) y 'tryhard' (más énfasis en streaks y comparación con la mejor racha histórica), seleccionable en configuración. Ambos modos respetan todas las reglas de negocio de arriba; la diferencia es solo de énfasis visual, no de lógica.

STACK:
- Expo + TypeScript + Expo Router
- Zustand para estado global
- AsyncStorage para persistencia local (sin backend)
- NativeWind para estilos
- expo-camera para escaneo de código de barras
- Fetch directo a OpenFoodFacts, sin backend propio

MODELO DE DATOS: definí interfaces TypeScript para UserProfile (incluyendo goalType, tdee, healthyRangeMin/Max, dailyGoal, mode, activityPreference), FoodEntry, ExerciseEntry, DailyLog (con totalConsumed, exerciseCredit, saved, isValidDay), SavingsBalance (con historial de movimientos earned/spent) y Achievement.

PANTALLAS:
1. Onboarding (perfil → cálculo → selección de meta y objetivo validado → preferencia de actividad → disclaimer)
2. Home (progreso del día, balance, streak, accesos a Registrar comida y Registrar actividad)
3. Registrar comida (tabs: Buscar / Escanear código / Manual, con favoritos y recientes)
4. Registrar actividad (tipo + duración, filtrado por preferencia de intensidad)
5. Banco (balance, botón Gastar con nota, historial de movimientos)
6. Historial (vista semanal/calendario de días válidos y ahorro)
7. Logros (grilla de streaks/consistencia)
8. Configuración (editar perfil y meta con validación de rango, cambiar modo, preferencia de actividad, reset de datos)

Empezá por el setup del proyecto, la estructura de carpetas con Expo Router, el store de Zustand con el modelo de datos y persistencia en AsyncStorage, y la utilidad de cálculo de TDEE/rangos. Después seguí con Onboarding y Home antes de las demás pantallas.

NO implementes: backend, login, funciones sociales, reconocimiento de comida por foto con IA, notificaciones push. Eso queda para versiones futuras.
```
