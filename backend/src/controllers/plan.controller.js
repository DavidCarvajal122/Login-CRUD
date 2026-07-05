const planService = require('../services/plan.service');

/**
 * plan.controller — ahora SOLO se encarga de la capa HTTP
 * (leer request, delegar al service, devolver response).
 * Toda la lógica de negocio y acceso a datos vive en service/repository.
 * Esto resuelve la violación original de Single Responsibility Principle.
 */

const getPlanes = async (req, res) => {
  try {
    const planes = await planService.listar();
    res.json(planes);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener planes' });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await planService.obtenerPorId(parseInt(req.params.id));
    res.json(plan);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener plan' });
  }
};

const createPlan = async (req, res) => {
  try {
    const plan = await planService.crear(req.body);
    res.status(201).json({ message: 'Plan creado correctamente', plan });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error al crear plan',
      required: error.required
    });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await planService.actualizar(parseInt(req.params.id), req.body);
    res.json({ message: 'Plan actualizado correctamente', plan });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al actualizar plan' });
  }
};

const deletePlan = async (req, res) => {
  try {
    await planService.eliminar(parseInt(req.params.id));
    res.json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al eliminar plan' });
  }
};

module.exports = { getPlanes, getPlanById, createPlan, updatePlan, deletePlan };
