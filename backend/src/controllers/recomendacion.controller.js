const pool = require('../config/db');

/**
 * POST /api/recomendaciones
 * Recibe preferencias del usuario y devuelve planes ordenados por compatibilidad
 */
const generarRecomendaciones = async (req, res) => {
  try {
    const id_usuario = req.user.id; // viene del JWT
    const {
      presupuesto_min,
      presupuesto_max,
      id_tipo_compania,
      categorias,      // array de IDs: [1, 3, 5]
      privacidad,      // true = privado, false = público
      origen           // 'propio' | 'todos'
    } = req.body;

    // ── Validaciones básicas ──────────────────────────
    if (presupuesto_min == null || presupuesto_max == null) {
      return res.status(400).json({
        message: 'El rango de presupuesto es obligatorio'
      });
    }

    const min = parseFloat(presupuesto_min);
    const max = parseFloat(presupuesto_max);

    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      return res.status(400).json({
        message: 'Los presupuestos deben ser números positivos'
      });
    }

    if (max < min) {
      return res.status(400).json({
        message: 'El presupuesto máximo debe ser mayor o igual al mínimo'
      });
    }

    // ── Traer todos los planes activos con sus categorías ──
    const [planes] = await pool.execute(`
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

    if (planes.length === 0) {
      return res.json({
        message: 'No hay planes disponibles',
        total: 0,
        recomendaciones: []
      });
    }

    // ── ALGORITMO DE PUNTAJE ──────────────────────────
    const PUNTAJE_MAXIMO = 100;

    const resultados = planes.map(plan => {
      let puntaje = 0;
      const detalle = {};

      // 1. PRESUPUESTO (30 pts)
      // El plan es compatible si sus rangos se solapan con los del usuario
      const presupuestoCompatible =
        parseFloat(plan.presupuesto_min) <= max &&
        parseFloat(plan.presupuesto_max) >= min;

      if (presupuestoCompatible) {
        puntaje += 30;
        detalle.presupuesto = '✅ 30pts — dentro del rango';
      } else {
        detalle.presupuesto = '❌ 0pts — fuera del rango';
      }

      // 2. TIPO DE COMPAÑÍA (25 pts)
      if (id_tipo_compania && plan.id_tipo_compania === parseInt(id_tipo_compania)) {
        puntaje += 25;
        detalle.tipo_compania = '✅ 25pts — coincide';
      } else if (!id_tipo_compania) {
        puntaje += 25; // si no especificó, no penalizar
        detalle.tipo_compania = '✅ 25pts — sin preferencia';
      } else {
        detalle.tipo_compania = '❌ 0pts — no coincide';
      }

      // 3. CATEGORÍAS (25 pts)
      if (categorias && categorias.length > 0) {
        const categoriasDelPlan = plan.categorias_ids
          ? plan.categorias_ids.split(',').map(Number)
          : [plan.id_categoria]; // fallback a categoría principal

        const coincidencias = categorias.filter(c =>
          categoriasDelPlan.includes(parseInt(c))
        ).length;

        if (coincidencias > 0) {
          // Puntaje proporcional según cuántas categorías coinciden
          const ptsCat = Math.round((coincidencias / categorias.length) * 25);
          puntaje += ptsCat;
          detalle.categorias = `✅ ${ptsCat}pts — ${coincidencias} categoría(s) coinciden`;
        } else {
          detalle.categorias = '❌ 0pts — ninguna categoría coincide';
        }
      } else {
        puntaje += 25; // sin preferencia, no penalizar
        detalle.categorias = '✅ 25pts — sin preferencia';
      }

      // 4. PRIVACIDAD (10 pts)
      if (privacidad != null) {
        const planPrivado = plan.privacidad === 1 || plan.privacidad === true;
        const usuarioQuierePrivado = privacidad === true || privacidad === 1;
        if (planPrivado === usuarioQuierePrivado) {
          puntaje += 10;
          detalle.privacidad = '✅ 10pts — coincide';
        } else {
          detalle.privacidad = '❌ 0pts — no coincide';
        }
      } else {
        puntaje += 10; // sin preferencia, no penalizar
        detalle.privacidad = '✅ 10pts — sin preferencia';
      }

      // 5. ORIGEN (10 pts)
      if (origen === 'propio') {
        if (plan.id_usuario === id_usuario) {
          puntaje += 10;
          detalle.origen = '✅ 10pts — plan propio';
        } else {
          detalle.origen = '❌ 0pts — no es propio';
        }
      } else {
        puntaje += 10; // 'todos' o sin preferencia
        detalle.origen = '✅ 10pts — sin preferencia';
      }

      // ── Calcular porcentaje ──
      const porcentaje = parseFloat(((puntaje / PUNTAJE_MAXIMO) * 100).toFixed(2));

      return {
        id:                       plan.id,
        nombre:                   plan.nombre,
        descripcion:              plan.descripcion,
        presupuesto_min:          plan.presupuesto_min,
        presupuesto_max:          plan.presupuesto_max,
        categoria:                plan.categoria_nombre,
        tipo_compania:            plan.tipo_compania_nombre,
        ciudad:                   plan.ciudad_nombre,
        privacidad:               plan.privacidad,
        puntaje_total:            puntaje,
        porcentaje_compatibilidad: porcentaje,
        detalle_puntaje:          detalle // útil para debugging
      };
    });

    // ── Ordenar de mayor a menor puntaje ──────────────
    resultados.sort((a, b) => b.puntaje_total - a.puntaje_total);

    // ── Filtrar planes con al menos 1 punto ──────────
    const recomendaciones = resultados.filter(r => r.puntaje_total > 0);

    // ── Guardar en tabla recomendaciones ─────────────
    for (const r of recomendaciones) {
      await pool.execute(
        `INSERT INTO recomendaciones 
         (id_usuario, id_plan, puntaje_total, porcentaje_compatibilidad)
         VALUES (?, ?, ?, ?)`,
        [id_usuario, r.id, r.puntaje_total, r.porcentaje_compatibilidad]
      );
    }

    res.json({
      message: 'Recomendaciones generadas correctamente',
      total: recomendaciones.length,
      preferencias_usadas: {
        presupuesto_min: min,
        presupuesto_max: max,
        id_tipo_compania,
        categorias,
        privacidad,
        origen
      },
      recomendaciones
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error al generar recomendaciones',
      error: error.message
    });
  }
};

/**
 * GET /api/recomendaciones/historial
 * Devuelve el historial de recomendaciones del usuario autenticado
 */
const getHistorial = async (req, res) => {
  try {
    const id_usuario = req.user.id;

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

    res.json({
      total: rows.length,
      historial: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

module.exports = { generarRecomendaciones, getHistorial };