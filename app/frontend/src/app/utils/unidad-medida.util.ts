/**
 * Utilidades para la gestión de unidades de medida e incrementos de cantidad en ingredientes
 */

/**
 * Lista de unidades de medida contables (discretas / enteros)
 */
const UNIDADES_CONTABLES = new Set([
  'unidad',
  'unidades',
  'u',
  'docena',
  'docenas',
  'pieza',
  'piezas',
  'pza',
  'pzas',
  'huevo',
  'huevos'
]);

/**
 * Determina si una unidad de medida es contable (se cuenta por unidades enteras)
 * @param unidad Nombre o símbolo de la unidad de medida
 */
export function esUnidadContable(unidad: string | null | undefined): boolean {
  if (!unidad) return false;
  return UNIDADES_CONTABLES.has(unidad.trim().toLowerCase());
}

/**
 * Retorna el incremento (step) adecuado según la unidad de medida en recetas de cocina/repostería:
 * - Para unidades base prácticas (ml, gr, unidad, docena, piezas, huevos, etc.): step 1
 *   (incremento de 1 en 1, por ejemplo: 300 ml -> 301 ml, 250 gr -> 251 gr, 8 u -> 9 u).
 * - Para unidades a granel (kg, lt): step 0.1 (décimas, por ejemplo: 0.5 kg -> 0.6 kg).
 * - En ningún caso se utilizan centésimas (0.01).
 * @param unidad Nombre o símbolo de la unidad de medida
 */
export function getStepPorUnidad(unidad: string | null | undefined): number {
  if (!unidad) return 1;
  const normalizada = unidad.trim().toLowerCase();

  if (
    normalizada === 'kg' || normalizada === 'kilo' || normalizada === 'kilos' ||
    normalizada === 'kilogramo' || normalizada === 'kilogramos' ||
    normalizada === 'lt' || normalizada === 'l' || normalizada === 'litro' || normalizada === 'litros'
  ) {
    return 0.1;
  }

  // Todas las unidades culinarias prácticas (gr, ml, unidad, docena, huevo, etc.) avanzan de 1 en 1
  return 1;
}

/**
 * Retorna el valor mínimo permitido para el control de entrada numérico.
 * Permite llegar a 0 si las reglas del formulario lo permiten.
 * @param unidad Nombre o símbolo de la unidad de medida
 */
export function getMinPorUnidad(unidad: string | null | undefined): number {
  return 0;
}
