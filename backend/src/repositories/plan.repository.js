const pool = require('../config/db');

/**
 * PlanRepository — Patrón Repository
 * Encapsula todo el acceso a la base de datos relacionado con planes.
 * Los controllers/services ya no dependen directamente de `pool` (mysql2),
 * sino de esta abstracción → resuelve Dependency Inversion Principle (DIP).
 */
class PlanRepository {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria, tc.nombre AS tipo_compania, cd.nombre AS ciudad
      FROM planes p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN tipos_compania tc ON p.id_tipo_compania = tc.id
      LEFT JOIN ciudades cd ON p.id_ciudad = cd.id
      WHERE p.estado = 1
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  async findAllForRecommendation() {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        c.nombre  AS categoria_nombre,
        tc.nombre AS tipo_compania_nombre,
        cd.nombre AS ciudad_nombre,
        GROUP_CONCAT(pc.id_categoria) AS categorias_ids
      FROM planes p
      LEFT JOIN categorias c    ON p.id_categoria     = c.id
      LEFT JOIN tipos_compania tc ON p.id_tipo_compania = tc.id
      LEFT JOIN ciudades cd     ON p.id_ciudad         = cd.id
      LEFT JOIN plan_categorias pc ON p.id             = pc.id_plan
      WHERE p.estado = 1
      GROUP BY p.id
    `);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(`
      SELECT p.*, c.nombre AS categoria, tc.nombre AS tipo_compania, cd.nombre AS ciudad
      FROM planes p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN tipos_compania tc ON p.id_tipo_compania = tc.id
      LEFT JOIN ciudades cd ON p.id_ciudad = cd.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  }

  async categoriaExiste(id) {
    const [[cat]] = await pool.execute('SELECT id FROM categorias WHERE id = ?', [id]);
    return !!cat;
  }

  async tipoCompaniaExiste(id) {
    const [[tipo]] = await pool.execute('SELECT id FROM tipos_compania WHERE id = ?', [id]);
    return !!tipo;
  }

  async ciudadExiste(id) {
    const [[ciudad]] = await pool.execute('SELECT id FROM ciudades WHERE id = ?', [id]);
    return !!ciudad;
  }

  async create(plan) {
    const [result] = await pool.execute(
      `INSERT INTO planes (nombre, descripcion, presupuesto_min, presupuesto_max,
        id_categoria, id_tipo_compania, id_ciudad, privacidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [plan.nombre, plan.descripcion, plan.presupuesto_min, plan.presupuesto_max,
       plan.id_categoria, plan.id_tipo_compania, plan.id_ciudad || null, plan.privacidad ? 1 : 0]
    );
    return result.insertId;
  }

  async update(id, plan) {
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
      [plan.nombre || null, plan.descripcion || null,
       plan.presupuesto_min ?? null, plan.presupuesto_max ?? null,
       plan.id_categoria || null, plan.id_tipo_compania || null,
       plan.id_ciudad || null, plan.privacidad != null ? (plan.privacidad ? 1 : 0) : null,
       id]
    );
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM planes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async insertRecomendacion(id_usuario, id_plan, puntaje, porcentaje) {
    await pool.execute(
      `INSERT INTO recomendaciones (id_usuario, id_plan, puntaje_total, porcentaje_compatibilidad)
       VALUES (?, ?, ?, ?)`,
      [id_usuario, id_plan, puntaje, porcentaje]
    );
  }

  async historialPorUsuario(id_usuario) {
    const [rows] = await pool.execute(`
      SELECT 
        r.id_recomendacion,
        r.puntaje_total,
        r.porcentaje_compatibilidad,
        r.fecha_recomendacion,
        p.nombre AS plan_nombre,
        p.descripcion,
        p.presupuesto_min,
        p.presupuesto_max
      FROM recomendaciones r
      JOIN planes p ON r.id_plan = p.id
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_recomendacion DESC
      LIMIT 50
    `, [id_usuario]);
    return rows;
  }
}

// Se exporta una única instancia (patrón Singleton implícito de Node al cachear el módulo)
module.exports = new PlanRepository();
