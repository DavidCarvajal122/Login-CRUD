const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { generarRecomendaciones, getHistorial } = require('../controllers/recomendacion.controller');

router.post('/',          verifyToken, generarRecomendaciones);
router.get('/historial',  verifyToken, getHistorial);

module.exports = router;