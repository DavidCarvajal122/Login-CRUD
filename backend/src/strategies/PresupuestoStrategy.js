const EvaluationStrategy = require('./EvaluationStrategy');

/** Evalúa si los rangos de presupuesto del plan y del usuario se solapan. Peso: 30 pts */
class PresupuestoStrategy extends EvaluationStrategy {
  evaluar(plan, preferencias) {
    const { presupuesto_min, presupuesto_max } = preferencias;

    const compatible =
      parseFloat(plan.presupuesto_min) <= presupuesto_max &&
      parseFloat(plan.presupuesto_max) >= presupuesto_min;

    return {
      puntos: compatible ? 30 : 0,
      detalle: compatible ? '30pts — dentro del rango' : '0pts — fuera del rango'
    };
  }
}

module.exports = PresupuestoStrategy;
