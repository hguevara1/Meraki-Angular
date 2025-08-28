// app/backend/models/torta.model.js
import mongoose from "mongoose";

const tortaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  subrecetas: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subreceta" }
  ],
  // Nuevo campo para el video de YouTube
  videoUrl: { 
    type: String,
    validate: {
      validator: function(url) {
        // Validar que sea una URL de YouTube válida
        return url === '' || /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(url);
      },
      message: 'Debe ser una URL válida de YouTube'
    }
  },
  // Campo opcional para imagen thumbnail (puede ser generado desde YouTube)
  thumbnailUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Método para obtener el thumbnail de YouTube automáticamente
tortaSchema.methods.getYouTubeThumbnail = function() {
  if (!this.videoUrl) return '';
  
  try {
    const videoId = this.extractYouTubeId(this.videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
  } catch (error) {
    console.error('Error generating YouTube thumbnail:', error);
  }
  return '';
};

// Método para extraer el ID de YouTube
tortaSchema.methods.extractYouTubeId = function(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Middleware para actualizar automáticamente el thumbnail antes de guardar
tortaSchema.pre('save', function(next) {
  if (this.isModified('videoUrl') && this.videoUrl) {
    this.thumbnailUrl = this.getYouTubeThumbnail();
  }
  next();
});

export default mongoose.model("Torta", tortaSchema);