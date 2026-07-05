const EvaluationStrategy = require('./EvaluationStrategy');

/** Evalúa si el plan es propio del usuario, cuando así se solicita. Peso: 10 pts */
class OrigenStrategy extends EvaluationStrategy {
  evaluar(plan, preferencias, contexto) {
    const { origen } = preferencias;
    const { id_usuario } = contexto;

    if (origen !== 'propio') {
      return { puntos: 10, detalle: '10pts — sin preferencia' };
    }

    const esPropio = plan.id_usuario === id_usuario;
    return {
      puntos: esPropio ? 10 : 0,
      detalle: esPropio ? '10pts — plan propio' : '0pts — no es propio'
    };
  }
}

module.exports = OrigenStrategy;
