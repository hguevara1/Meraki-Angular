import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Registrar usuario
// user.controller.js - Modificar registerUser
export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password, confirmPassword } = req.body;

    // Validaciones
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    // Verificar si es el primer usuario (será admin)
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      nombre,
      apellido,
      email: email.toLowerCase().trim(),
      telefono,
      password: hashedPassword,
      role // Asignar rol automáticamente
    });

    await user.save();
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      role // Enviar el rol al frontend si es necesario
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    res.status(400).json({ message: "Error al registrar usuario", error: error.message });
  }
};

// Login usuario
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Verificar método de autenticación válido
    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: "Este usuario solo puede acceder con Google Login"
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Usuario sin método de autenticación válido"
      });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // ✅ GENERAR TOKEN (login exitoso)
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        apellido: user.apellido
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// Obtener usuario por ID
export const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password');
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const usuario = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar usuario", error: error.message });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
};