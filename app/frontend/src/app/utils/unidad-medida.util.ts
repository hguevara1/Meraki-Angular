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
 * Retorna el incremento (step) permitido según la unidad de medida:
 * - Para ingredientes contables (como huevos, unidades o piezas): 1 (unidad completa)
 * - Para unidades fraccionables (como kg, lt, gr, ml): 0.01 (conservando precisión decimal existente)
 * @param unidad Nombre o símbolo de la unidad de medida
 */
export function getStepPorUnidad(unidad: string | null | undefined): number {
  return esUnidadContable(unidad) ? 1 : 0.01;
}

/**
 * Retorna el valor mínimo permitido para el control de entrada numérico.
 * Permite llegar a 0 si las reglas del formulario lo permiten.
 * @param unidad Nombre o símbolo de la unidad de medida
 */
export function getMinPorUnidad(unidad: string | null | undefined): number {
  return 0;
}
