const pool = require('../config/db');

const getPaises = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM paises ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener países', error: error.message });
  }
};

const getProvincias = async (req, res) => {
  try {
    const id_pais = parseInt(req.params.paisId);
    if (isNaN(id_pais)) return res.status(400).json({ message: 'ID de país inválido' });

    const [rows] = await pool.execute(
      'SELECT * FROM provincias WHERE id_pais = ? ORDER BY nombre',
      [id_pais]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener provincias', error: error.message });
  }
};

const getCiudades = async (req, res) => {
  try {
    const id_provincia = parseInt(req.params.provinciaId);
    if (isNaN(id_provincia)) return res.status(400).json({ message: 'ID de provincia inválido' });

    const [rows] = await pool.execute(
      'SELECT * FROM ciudades WHERE id_provincia = ? ORDER BY nombre',
      [id_provincia]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ciudades', error: error.message });
  }
};

module.exports = { getPaises, getProvincias, getCiudades };
