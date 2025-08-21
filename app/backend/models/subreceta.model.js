import mongoose from "mongoose";

const subrecetaSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },   // Ej: Harina
  cantidad: { type: Number, required: true },      // Ej: 900
  costo: { type: Number }                          // Se puede calcular dinámicamente
}, {
  timestamps: true
});

export default mongoose.model("Subreceta", subrecetaSchema);
