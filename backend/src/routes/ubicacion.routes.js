const express = require('express');
const router = express.Router();
const { getPaises, getProvincias, getCiudades } = require('../controllers/ubicacion.controller');

// Todas públicas — necesarias para cargar los dropdowns en cascada
router.get('/paises',                  getPaises);
router.get('/provincias/:paisId',      getProvincias);
router.get('/ciudades/:provinciaId',   getCiudades);

module.exports = router;
