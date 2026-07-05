const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * UserRepository — Patrón Repository
 * Encapsula el acceso a la tabla `usuarios`.
 */
class UserRepository {
  async findAll() {
    const [rows] = await pool.execute('SELECT id, nombre, correo, rol FROM usuarios');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findByCorreo(correo) {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    return rows[0] || null;
  }

  async correoExiste(correo) {
    const [rows] = await pool.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    return rows.length > 0;
  }

  async create({ nombre, correo, contrasena }) {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hashedPassword]
    );
    return result.insertId;
  }

  async update(id, { nombre, correo }) {
    const [result] = await pool.execute(
      'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
      [nombre, correo, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new UserRepository();
