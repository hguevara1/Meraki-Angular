import mongoose from "mongoose";

const ingredienteEnSubrecetaSchema = new mongoose.Schema({
  ingrediente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingrediente",
    required: true
  },
  cantidad: { type: Number, required: true }, // Ej: 900
  costo: { type: Number } // Puede calcularse dinámicamente a partir del precio del ingrediente
});

const subrecetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // Ej: "Bizcocho"
  ingredientes: [ingredienteEnSubrecetaSchema], // Lista de ingredientes con referencia
}, {
  timestamps: true
});

export default mongoose.model("Subreceta", subrecetaSchema);

