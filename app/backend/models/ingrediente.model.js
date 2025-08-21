import mongoose from "mongoose";

const ingredienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true  // ✅ Agregado unique para evitar duplicados
  },
  precio: { type: Number },
  medida: { type: Number },
  unidad: { type: String }
}, {
  timestamps: true
});

export default mongoose.model("Ingrediente", ingredienteSchema);