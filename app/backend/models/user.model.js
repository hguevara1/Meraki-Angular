import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  telefono: { type: String },
  password: { type: String }, // Opcional para usuarios de Google
  googleId: { type: String }, // Para autenticación con Google
  avatar: { type: String }, // Imagen de perfil de Google
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  timestamps: true
});

// Método para obtener nombre completo
userSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

export default mongoose.model("User", userSchema);