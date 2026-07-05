const userRepository = require('../repositories/user.repository');

const getUsers = async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userRepository.findById(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const existe = await userRepository.correoExiste(correo);
    if (existe) return res.status(409).json({ message: 'El correo ya está registrado' });

    const id = await userRepository.create({ nombre, correo, contrasena });

    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: { id, nombre, correo }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, correo } = req.body;

    const actualizado = await userRepository.update(id, { nombre, correo });
    if (!actualizado) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = await userRepository.findById(id);
    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const eliminado = await userRepository.delete(parseInt(req.params.id));
    if (!eliminado) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
