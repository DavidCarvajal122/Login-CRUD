const planRepository = require('../repositories/plan.repository');
const estrategias = require('../strategies');

const PUNTAJE_MAXIMO = 100;

/**
 * RecomendacionService — Single Responsibility Principle
 * Concentra la LÓGICA DE NEGOCIO del algoritmo de recomendación,
 * separada del controlador (HTTP) y del repositorio (acceso a datos).
 */
class RecomendacionService {
  async generar(id_usuario, preferencias) {
    this._validarPresupuesto(preferencias.presupuesto_min, preferencias.presupuesto_max);

    const planes = await planRepository.findAllForRecommendation();

    const resultados = planes.map(plan =>
      this._evaluarPlan(plan, preferencias, { id_usuario })
    );

    resultados.sort((a, b) => b.puntaje_total - a.puntaje_total);
    const recomendaciones = resultados.filter(r => r.puntaje_total > 0);

    for (const r of recomendaciones) {
      await planRepository.insertRecomendacion(
        id_usuario, r.id, r.puntaje_total, r.porcentaje_compatibilidad
      );
    }

    return recomendaciones;
  }

  async historial(id_usuario) {
    return planRepository.historialPorUsuario(id_usuario);
  }

  _evaluarPlan(plan, preferencias, contexto) {
    let puntaje = 0;
    const detalle = {};

    // Ejecución polimórfica: el service no conoce el detalle interno
    // de cada criterio, solo que todos exponen evaluar(plan, prefs, ctx)
    for (const { key, instancia } of estrategias) {
      const resultado = instancia.evaluar(plan, preferencias, contexto);
      puntaje += resultado.puntos;
      detalle[key] = resultado.detalle;
    }

    const porcentaje = parseFloat(((puntaje / PUNTAJE_MAXIMO) * 100).toFixed(2));

    return {
      id: plan.id,
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      presupuesto_min: plan.presupuesto_min,
      presupuesto_max: plan.presupuesto_max,
      categoria: plan.categoria_nombre,
      tipo_compania: plan.tipo_compania_nombre,
      ciudad: plan.ciudad_nombre,
      privacidad: plan.privacidad,
      puntaje_total: puntaje,
      porcentaje_compatibilidad: porcentaje,
      detalle_puntaje: detalle
    };
  }

  _validarPresupuesto(min, max) {
    if (min == null || max == null) {
      throw { status: 400, message: 'El rango de presupuesto es obligatorio' };
    }
    const minN = parseFloat(min);
    const maxN = parseFloat(max);
    if (isNaN(minN) || isNaN(maxN) || minN < 0 || maxN < 0) {
      throw { status: 400, message: 'Los presupuestos deben ser números positivos' };
    }
    if (maxN < minN) {
      throw { status: 400, message: 'El presupuesto máximo debe ser mayor o igual al mínimo' };
    }
  }
}

module.exports = new RecomendacionService();
