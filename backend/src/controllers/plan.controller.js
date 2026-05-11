const pool = require('../config/db');

const getPlanes = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria, tc.nombre AS tipo_compania, cd.nombre AS ciudad
      FROM planes p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN tipos_compania tc ON p.id_tipo_compania = tc.id
      LEFT JOIN ciudades cd ON p.id_ciudad = cd.id
      WHERE p.estado = 1
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener planes', error: error.message });
  }
};

const getPlanById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria, tc.nombre AS tipo_compania, cd.nombre AS ciudad
      FROM planes p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN tipos_compania tc ON p.id_tipo_compania = tc.id
      LEFT JOIN ciudades cd ON p.id_ciudad = cd.id
      WHERE p.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener plan', error: error.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const { nombre, descripcion, presupuesto_min, presupuesto_max,
            id_categoria, id_tipo_compania, id_ciudad, privacidad } = req.body;

    // ── Validaciones obligatorias ──
    if (!nombre || !descripcion || presupuesto_min == null || presupuesto_max == null || !id_categoria || !id_tipo_compania) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios',
        required: ['nombre', 'descripcion', 'presupuesto_min', 'presupuesto_max', 'id_categoria', 'id_tipo_compania']
      });
    }

    const min = parseFloat(presupuesto_min);
    const max = parseFloat(presupuesto_max);

    // ── Validaciones de presupuesto (DATO SENSIBLE) ──
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({ message: 'Los presupuestos deben ser números válidos' });
    }
    if (min < 0 || max < 0) {
      return res.status(400).json({ message: 'Los presupuestos no pueden ser negativos' });
    }
    if (max < min) {
      return res.status(400).json({
        message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
        detalle: { presupuesto_min: min, presupuesto_max: max }
      });
    }

    // ── Validar que las FK existen ──
    const [[cat]] = await pool.execute('SELECT id FROM categorias WHERE id = ?', [id_categoria]);
    if (!cat) return res.status(400).json({ message: 'La categoría indicada no existe' });

    const [[tipo]] = await pool.execute('SELECT id FROM tipos_compania WHERE id = ?', [id_tipo_compania]);
    if (!tipo) return res.status(400).json({ message: 'El tipo de compañía indicado no existe' });

    if (id_ciudad) {
      const [[ciudad]] = await pool.execute('SELECT id FROM ciudades WHERE id = ?', [id_ciudad]);
      if (!ciudad) return res.status(400).json({ message: 'La ciudad indicada no existe' });
    }

    const [result] = await pool.execute(
      `INSERT INTO planes (nombre, descripcion, presupuesto_min, presupuesto_max,
        id_categoria, id_tipo_compania, id_ciudad, privacidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, min, max, id_categoria, id_tipo_compania,
       id_ciudad || null, privacidad ? 1 : 0]
    );

    res.status(201).json({
      message: 'Plan creado correctamente',
      plan: { id: result.insertId, nombre, descripcion, presupuesto_min: min, presupuesto_max: max }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear plan', error: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, presupuesto_min, presupuesto_max,
            id_categoria, id_tipo_compania, id_ciudad, privacidad } = req.body;

    const [[existing]] = await pool.execute('SELECT id FROM planes WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ message: 'Plan no encontrado' });

    // Validaciones de presupuesto si vienen en el body
    if (presupuesto_min != null && presupuesto_max != null) {
      const min = parseFloat(presupuesto_min);
      const max = parseFloat(presupuesto_max);
      if (isNaN(min) || isNaN(max)) return res.status(400).json({ message: 'Presupuestos inválidos' });
      if (min < 0 || max < 0) return res.status(400).json({ message: 'Los presupuestos no pueden ser negativos' });
      if (max < min) return res.status(400).json({ message: 'El presupuesto máximo debe ser mayor o igual al mínimo' });
    }

    await pool.execute(
      `UPDATE planes SET
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        presupuesto_min = COALESCE(?, presupuesto_min),
        presupuesto_max = COALESCE(?, presupuesto_max),
        id_categoria = COALESCE(?, id_categoria),
        id_tipo_compania = COALESCE(?, id_tipo_compania),
        id_ciudad = COALESCE(?, id_ciudad),
        privacidad = COALESCE(?, privacidad)
       WHERE id = ?`,
      [nombre || null, descripcion || null,
       presupuesto_min != null ? parseFloat(presupuesto_min) : null,
       presupuesto_max != null ? parseFloat(presupuesto_max) : null,
       id_categoria || null, id_tipo_compania || null,
       id_ciudad || null, privacidad != null ? (privacidad ? 1 : 0) : null,
       id]
    );

    const [[updated]] = await pool.execute('SELECT * FROM planes WHERE id = ?', [id]);
    res.json({ message: 'Plan actualizado correctamente', plan: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar plan', error: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.execute('DELETE FROM planes WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar plan', error: error.message });
  }
};

module.exports = { getPlanes, getPlanById, createPlan, updatePlan, deletePlan };
