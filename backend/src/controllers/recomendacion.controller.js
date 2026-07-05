const recomendacionService = require('../services/recomendacion.service');

/**
 * recomendacion.controller — capa HTTP del algoritmo de recomendación.
 * El cálculo de puntaje (Strategy Pattern) vive en recomendacion.service.js
 * y el acceso a datos en plan.repository.js.
 */

const generarRecomendaciones = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const recomendaciones = await recomendacionService.generar(id_usuario, req.body);

    res.json({
      message: 'Recomendaciones generadas correctamente',
      total: recomendaciones.length,
      preferencias_usadas: req.body,
      recomendaciones
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al generar recomendaciones' });
  }
};

const getHistorial = async (req, res) => {
  try {
    const historial = await recomendacionService.historial(req.user.id);
    res.json({ total: historial.length, historial });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener historial' });
  }
};

module.exports = { generarRecomendaciones, getHistorial };
