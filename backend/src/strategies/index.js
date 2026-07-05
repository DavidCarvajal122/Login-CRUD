const PresupuestoStrategy  = require('./PresupuestoStrategy');
const TipoCompaniaStrategy = require('./TipoCompaniaStrategy');
const CategoriaStrategy    = require('./CategoriaStrategy');
const PrivacidadStrategy   = require('./PrivacidadStrategy');
const OrigenStrategy       = require('./OrigenStrategy');

/**
 * Registro de estrategias de evaluación.
 *
 * Open/Closed Principle: para agregar un nuevo criterio de puntaje
 * (por ejemplo "distancia" o "temporada") solo se crea una nueva clase
 * que extienda EvaluationStrategy y se agrega una línea aquí.
 * Ninguna estrategia existente ni el servicio que las consume
 * necesitan modificarse.
 */
const estrategias = [
  { key: 'presupuesto',   instancia: new PresupuestoStrategy() },
  { key: 'tipo_compania', instancia: new TipoCompaniaStrategy() },
  { key: 'categorias',    instancia: new CategoriaStrategy() },
  { key: 'privacidad',    instancia: new PrivacidadStrategy() },
  { key: 'origen',        instancia: new OrigenStrategy() }
];

module.exports = estrategias;
