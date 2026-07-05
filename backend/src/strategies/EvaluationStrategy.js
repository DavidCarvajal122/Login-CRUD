/**
 * EvaluationStrategy — contrato común del patrón Strategy.
 * Toda estrategia de evaluación de un criterio de recomendación
 * debe implementar el método evaluar(plan, preferencias, contexto).
 */
class EvaluationStrategy {
  evaluar(plan, preferencias, contexto) {
    throw new Error('El método evaluar() debe implementarse en la subclase');
  }
}

module.exports = EvaluationStrategy;
