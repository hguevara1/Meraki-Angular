import mongoose from "mongoose";

const tortaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  subrecetas: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subreceta" }
  ] // Una torta puede tener varias subrecetas
}, {
  timestamps: true
});

export default mongoose.model("Torta", tortaSchema);
