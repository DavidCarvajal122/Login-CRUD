const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const {
  getCategorias, getCategoriaById,
  createCategoria, updateCategoria, deleteCategoria
} = require('../controllers/categoria.controller');

router.get('/',      getCategorias);          // pública (necesaria para dropdowns)
router.get('/:id',   getCategoriaById);
router.post('/',     verifyToken, createCategoria);
router.put('/:id',   verifyToken, updateCategoria);
router.delete('/:id',verifyToken, deleteCategoria);

module.exports = router;
