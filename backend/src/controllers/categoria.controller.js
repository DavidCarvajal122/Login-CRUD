const pool = require('../config/db');

const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categorias WHERE estado = 1 ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

const getCategoriaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute('SELECT * FROM categorias WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' });

    const [result] = await pool.execute(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    res.status(201).json({ message: 'Categoría creada', categoria: { id: result.insertId, nombre, descripcion } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'La categoría ya existe' });
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' });

    const [result] = await pool.execute(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría actualizada', categoria: { id, nombre, descripcion } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verificar si tiene planes asociados
    const [planes] = await pool.execute(
      'SELECT COUNT(*) AS total FROM planes WHERE id_categoria = ?', [id]
    );
    if (planes[0].total > 0) {
      return res.status(409).json({ message: 'No se puede eliminar: tiene planes asociados' });
    }

    const [result] = await pool.execute('DELETE FROM categorias WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
  }
};

module.exports = { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
