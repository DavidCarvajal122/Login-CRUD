const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* SOLID - SRP
   Funciones separadas para validar, encriptar, generar token y crear respuesta.
*/

/* SOLID - OCP
   Esta función permite validar cualquier cantidad de campos sin modificar su lógica.
*/
const validarCampos = (...campos) => {
  return campos.every(campo => campo);
};

/* Patrón Strategy
   Cada tipo de respuesta está separado como una estrategia reutilizable.
*/
const respuestaStrategy = {
  camposObligatorios: (res, mensaje) => {
    return res.status(400).json({ message: mensaje });
  },

  correoRegistrado: (res) => {
    return res.status(409).json({ message: 'El correo ya está registrado' });
  },

  credencialesIncorrectas: (res) => {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  },

  errorServidor: (res, mensaje, error) => {
    return res.status(500).json({
      message: mensaje,
      error: error.message
    });
  }
};

/* Patrón Factory
   Crea objetos usuario de forma centralizada.
*/
const crearUsuario = (id, nombre, correo, rol = null) => {
  const usuario = {
    id,
    nombre,
    correo
  };

  if (rol) {
    usuario.rol = rol;
  }

  return usuario;
};

const encriptarPassword = async (contrasena) => {
  return await bcrypt.hash(contrasena, 10);
};

const generarToken = (user) => {
  return jwt.sign(
      {
        id: user.id,
        correo: user.correo,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
  );
};

const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // SOLID - OCP
    if (!validarCampos(nombre, correo, contrasena)) {
      return respuestaStrategy.camposObligatorios(
          res,
          'Todos los campos son obligatorios'
      );
    }

    const [existingUsers] = await pool.execute(
        'SELECT id FROM usuarios WHERE correo = ?',
        [correo]
    );

    if (existingUsers.length > 0) {
      return respuestaStrategy.correoRegistrado(res);
    }

    // SOLID - SRP
    const hashedPassword = await encriptarPassword(contrasena);

    const [result] = await pool.execute(
        'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
        [nombre, correo, hashedPassword]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      // Patrón Factory
      user: crearUsuario(result.insertId, nombre, correo)
    });
  } catch (error) {
    return respuestaStrategy.errorServidor(
        res,
        'Error al registrar usuario',
        error
    );
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // SOLID - OCP
    if (!validarCampos(correo, contrasena)) {
      return respuestaStrategy.camposObligatorios(
          res,
          'Correo y contraseña son obligatorios'
      );
    }

    const [rows] = await pool.execute(
        'SELECT * FROM usuarios WHERE correo = ?',
        [correo]
    );

    if (rows.length === 0) {
      return respuestaStrategy.credencialesIncorrectas(res);
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!passwordMatch) {
      return respuestaStrategy.credencialesIncorrectas(res);
    }

    // SOLID - SRP
    const token = generarToken(user);

    res.json({
      message: 'Login exitoso',
      token,
      // Patrón Factory
      user: crearUsuario(
          user.id,
          user.nombre,
          user.correo,
          user.rol
      )
    });
  } catch (error) {
    return respuestaStrategy.errorServidor(
        res,
        'Error al iniciar sesión',
        error
    );
  }
};

module.exports = {
  register,
  login
};