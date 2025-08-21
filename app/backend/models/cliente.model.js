import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String },
  password: { type: String, required: true } // en backend se guarda hasheada con bcrypt
}, {
  timestamps: true
});

export default mongoose.model("Cliente", clienteSchema);
