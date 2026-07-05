const EvaluationStrategy = require('./EvaluationStrategy');

/** Evalúa si el tipo de compañía del plan coincide con la preferencia del usuario. Peso: 25 pts */
class TipoCompaniaStrategy extends EvaluationStrategy {
  evaluar(plan, preferencias) {
    const { id_tipo_compania } = preferencias;

    if (!id_tipo_compania) {
      return { puntos: 25, detalle: '25pts — sin preferencia' };
    }

    const coincide = plan.id_tipo_compania === parseInt(id_tipo_compania);
    return {
      puntos: coincide ? 25 : 0,
      detalle: coincide ? '25pts — coincide' : '0pts — no coincide'
    };
  }
}

module.exports = TipoCompaniaStrategy;
