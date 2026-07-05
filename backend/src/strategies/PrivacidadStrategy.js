const EvaluationStrategy = require('./EvaluationStrategy');

/** Evalúa si la privacidad del plan coincide con la preferencia. Peso: 10 pts */
class PrivacidadStrategy extends EvaluationStrategy {
  evaluar(plan, preferencias) {
    const { privacidad } = preferencias;

    if (privacidad == null) {
      return { puntos: 10, detalle: '10pts — sin preferencia' };
    }

    const planPrivado = plan.privacidad === 1 || plan.privacidad === true;
    const usuarioQuierePrivado = privacidad === true || privacidad === 1;
    const coincide = planPrivado === usuarioQuierePrivado;

    return {
      puntos: coincide ? 10 : 0,
      detalle: coincide ? '10pts — coincide' : '0pts — no coincide'
    };
  }
}

module.exports = PrivacidadStrategy;
