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

    it('debería retornar false para unidades fraccionables', () => {
      expect(esUnidadContable('kg')).toBeFalse();
      expect(esUnidadContable('lt')).toBeFalse();
      expect(esUnidadContable('gr')).toBeFalse();
      expect(esUnidadContable('ml')).toBeFalse();
      expect(esUnidadContable('kilos')).toBeFalse();
      expect(esUnidadContable('litros')).toBeFalse();
      expect(esUnidadContable('gramos')).toBeFalse();
    });

    it('debería retornar false para valores nulos, indefinidos o vacíos', () => {
      expect(esUnidadContable(null)).toBeFalse();
      expect(esUnidadContable(undefined)).toBeFalse();
      expect(esUnidadContable('')).toBeFalse();
      expect(esUnidadContable('   ')).toBeFalse();
    });
  });

  describe('getStepPorUnidad', () => {
    it('debería retornar 1 para ingredientes contables', () => {
      expect(getStepPorUnidad('unidad')).toBe(1);
      expect(getStepPorUnidad('unidades')).toBe(1);
      expect(getStepPorUnidad('u')).toBe(1);
      expect(getStepPorUnidad('huevo')).toBe(1);
      expect(getStepPorUnidad('huevos')).toBe(1);
      expect(getStepPorUnidad('docena')).toBe(1);
      expect(getStepPorUnidad('pieza')).toBe(1);
    });

    it('debería retornar 0.01 para unidades fraccionables preservando su precisión decimal', () => {
      expect(getStepPorUnidad('kg')).toBe(0.01);
      expect(getStepPorUnidad('lt')).toBe(0.01);
      expect(getStepPorUnidad('gr')).toBe(0.01);
      expect(getStepPorUnidad('ml')).toBe(0.01);
    });

    it('debería simular incremento y decremento de unidad entera correctamente', () => {
      const step = getStepPorUnidad('unidad');
      // Incremento de 8 unidades debe pasar a 9
      const cantidadInicial = 8;
      const incrementado = cantidadInicial + step;
      expect(incrementado).toBe(9);

      // Decremento de 1 unidad debe pasar a 0
      const uno = 1;
      const decrementado = uno - step;
      expect(decrementado).toBe(0);
    });

    it('debería simular incremento y decremento fraccionable correctamente', () => {
      const step = getStepPorUnidad('kg');
      const cantidadInicial = 0.50;
      const incrementado = +(cantidadInicial + step).toFixed(2);
      expect(incrementado).toBe(0.51);
    });
  });

  describe('getMinPorUnidad', () => {
    it('debería retornar 0 permitiendo decrementar a cero cuando las reglas lo contemplan', () => {
      expect(getMinPorUnidad('unidad')).toBe(0);
      expect(getMinPorUnidad('kg')).toBe(0);
    });
  });
});
