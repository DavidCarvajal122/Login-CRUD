const EvaluationStrategy = require('./EvaluationStrategy');

/** Evalúa la coincidencia proporcional de categorías. Peso: 25 pts */
class CategoriaStrategy extends EvaluationStrategy {
  evaluar(plan, preferencias) {
    const { categorias } = preferencias;

    if (!categorias || categorias.length === 0) {
      return { puntos: 25, detalle: '25pts — sin preferencia' };
    }

    const categoriasDelPlan = plan.categorias_ids
      ? plan.categorias_ids.split(',').map(Number)
      : [plan.id_categoria];

    const coincidencias = categorias.filter(c =>
      categoriasDelPlan.includes(parseInt(c))
    ).length;

    if (coincidencias === 0) {
      return { puntos: 0, detalle: '0pts — ninguna categoría coincide' };
    }

    const puntos = Math.round((coincidencias / categorias.length) * 25);
    return { puntos, detalle: `${puntos}pts — ${coincidencias} categoría(s) coinciden` };
  }
}

module.exports = CategoriaStrategy;
