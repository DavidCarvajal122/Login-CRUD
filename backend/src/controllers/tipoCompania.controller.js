const pool = require('../config/db');

const getTiposCompania = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tipos_compania ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tipos de compañía', error: error.message });
  }
};

module.exports = { getTiposCompania };
