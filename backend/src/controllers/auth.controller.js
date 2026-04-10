const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
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
      message: 'Usuario registrado correctamente',
      user: {
        id: result.insertId,
        nombre,
        correo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        message: 'Correo y contraseña son obligatorios'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Credenciales incorrectas'
      });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};