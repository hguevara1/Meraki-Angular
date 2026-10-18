import { esUnidadContable, getStepPorUnidad, getMinPorUnidad } from './unidad-medida.util';

describe('unidad-medida.util', () => {
  describe('esUnidadContable', () => {
    it('debería retornar true para unidades contables estándar', () => {
      expect(esUnidadContable('unidad')).toBeTrue();
      expect(esUnidadContable('unidades')).toBeTrue();
      expect(esUnidadContable('u')).toBeTrue();
      expect(esUnidadContable('docena')).toBeTrue();
      expect(esUnidadContable('pieza')).toBeTrue();
      expect(esUnidadContable('piezas')).toBeTrue();
      expect(esUnidadContable('huevo')).toBeTrue();
      expect(esUnidadContable('huevos')).toBeTrue();
    });

    it('debería ser insensible a mayúsculas y espacios en blanco', () => {
      expect(esUnidadContable('  UNIDAD  ')).toBeTrue();
      expect(esUnidadContable('HUEVOS')).toBeTrue();
      expect(esUnidadContable(' Docena ')).toBeTrue();
      expect(esUnidadContable('U')).toBeTrue();
    });

    it('debería retornar false para unidades de peso y volumen', () => {
      expect(esUnidadContable('kg')).toBeFalse();
      expect(esUnidadContable('lt')).toBeFalse();
      expect(esUnidadContable('gr')).toBeFalse();
      expect(esUnidadContable('ml')).toBeFalse();
    });

    it('debería retornar false para valores nulos, indefinidos o vacíos', () => {
      expect(esUnidadContable(null)).toBeFalse();
      expect(esUnidadContable(undefined)).toBeFalse();
      expect(esUnidadContable('')).toBeFalse();
      expect(esUnidadContable('   ')).toBeFalse();
    });
  });

  describe('getStepPorUnidad', () => {
    it('debería retornar 1 para ingredientes contables y unidades culinarias prácticas (unidad, ml, gr)', () => {
      expect(getStepPorUnidad('unidad')).toBe(1);
      expect(getStepPorUnidad('unidades')).toBe(1);
      expect(getStepPorUnidad('u')).toBe(1);
      expect(getStepPorUnidad('huevo')).toBe(1);
      expect(getStepPorUnidad('huevos')).toBe(1);
      expect(getStepPorUnidad('docena')).toBe(1);
      expect(getStepPorUnidad('pieza')).toBe(1);
      expect(getStepPorUnidad('ml')).toBe(1);
      expect(getStepPorUnidad('gr')).toBe(1);
      expect(getStepPorUnidad('g')).toBe(1);
    });

    it('debería retornar 0.1 para unidades a granel (kg, lt)', () => {
      expect(getStepPorUnidad('kg')).toBe(0.1);
      expect(getStepPorUnidad('lt')).toBe(0.1);
      expect(getStepPorUnidad('kilos')).toBe(0.1);
      expect(getStepPorUnidad('litros')).toBe(0.1);
    });

    it('debería simular incremento de 300 ml a 301 ml (ejemplo de negocio en repostería)', () => {
      const step = getStepPorUnidad('ml');
      const cantidadInicial = 300;
      const incrementado = cantidadInicial + step;
      expect(incrementado).toBe(301);
    });

    it('debería simular incremento de 8 unidades a 9 unidades y decremento de 1 a 0', () => {
      const step = getStepPorUnidad('unidad');
      const cantidadInicial = 8;
      const incrementado = cantidadInicial + step;
      expect(incrementado).toBe(9);

      const uno = 1;
      const decrementado = uno - step;
      expect(decrementado).toBe(0);
    });

    it('debería simular incremento de 250 gr a 251 gr', () => {
      const step = getStepPorUnidad('gr');
      const cantidadInicial = 250;
      const incrementado = cantidadInicial + step;
      expect(incrementado).toBe(251);
    });
  });

  describe('getMinPorUnidad', () => {
    it('debería retornar 0 permitiendo decrementar a cero cuando las reglas lo contemplan', () => {
      expect(getMinPorUnidad('unidad')).toBe(0);
      expect(getMinPorUnidad('ml')).toBe(0);
      expect(getMinPorUnidad('kg')).toBe(0);
    });
  });
});
