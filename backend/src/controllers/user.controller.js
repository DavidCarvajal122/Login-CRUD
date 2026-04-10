const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, correo FROM usuarios'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [rows] = await pool.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios'
      });
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'El correo ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hashedPassword]
    );

    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        id: result.insertId,
        nombre,
        correo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, correo } = req.body;

    const [result] = await pool.execute(
      'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
      [nombre, correo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const [updatedRows] = await pool.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Usuario actualizado correctamente',
      user: updatedRows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [result] = await pool.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};