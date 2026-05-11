const express = require('express');
const router = express.Router();
const { getTiposCompania } = require('../controllers/tipoCompania.controller');

router.get('/', getTiposCompania); // pública — para dropdowns

module.exports = router;
