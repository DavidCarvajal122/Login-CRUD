const planRepository = require('../repositories/plan.repository');

/**
 * PlanService — separa la lógica de negocio del CRUD de planes
 * del controlador HTTP y del acceso a datos.
 */
class PlanService {
  async listar() {
    return planRepository.findAll();
  }

  async obtenerPorId(id) {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan no encontrado' };
    return plan;
  }

  async crear(datos) {
    this._validarDatosObligatorios(datos);
    const { presupuesto_min, presupuesto_max } =
      this._validarPresupuesto(datos.presupuesto_min, datos.presupuesto_max);

    const categoriaExiste = await planRepository.categoriaExiste(datos.id_categoria);
    if (!categoriaExiste) throw { status: 400, message: 'La categoría indicada no existe' };

    const tipoExiste = await planRepository.tipoCompaniaExiste(datos.id_tipo_compania);
    if (!tipoExiste) throw { status: 400, message: 'El tipo de compañía indicado no existe' };

    if (datos.id_ciudad) {
      const ciudadExiste = await planRepository.ciudadExiste(datos.id_ciudad);
      if (!ciudadExiste) throw { status: 400, message: 'La ciudad indicada no existe' };
    }

    const id = await planRepository.create({ ...datos, presupuesto_min, presupuesto_max });
    return { id, ...datos, presupuesto_min, presupuesto_max };
  }

  async actualizar(id, datos) {
    const existente = await planRepository.findById(id);
    if (!existente) throw { status: 404, message: 'Plan no encontrado' };

    if (datos.presupuesto_min != null && datos.presupuesto_max != null) {
      this._validarPresupuesto(datos.presupuesto_min, datos.presupuesto_max);
    }

    return planRepository.update(id, datos);
  }

  async eliminar(id) {
    const eliminado = await planRepository.delete(id);
    if (!eliminado) throw { status: 404, message: 'Plan no encontrado' };
  }

  _validarDatosObligatorios({ nombre, descripcion, presupuesto_min, presupuesto_max, id_categoria, id_tipo_compania }) {
    if (!nombre || !descripcion || presupuesto_min == null || presupuesto_max == null || !id_categoria || !id_tipo_compania) {
      throw {
        status: 400,
        message: 'Faltan campos obligatorios',
        required: ['nombre', 'descripcion', 'presupuesto_min', 'presupuesto_max', 'id_categoria', 'id_tipo_compania']
      };
    }
  }

  _validarPresupuesto(min, max) {
    const minN = parseFloat(min);
    const maxN = parseFloat(max);
    if (isNaN(minN) || isNaN(maxN)) throw { status: 400, message: 'Los presupuestos deben ser números válidos' };
    if (minN < 0 || maxN < 0) throw { status: 400, message: 'Los presupuestos no pueden ser negativos' };
    if (maxN < minN) throw { status: 400, message: 'El presupuesto máximo debe ser mayor o igual al mínimo' };
    return { presupuesto_min: minN, presupuesto_max: maxN };
  }
}

module.exports = new PlanService();
