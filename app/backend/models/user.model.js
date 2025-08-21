import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  password: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema); // Cambiado de clienteSchema a userSchema