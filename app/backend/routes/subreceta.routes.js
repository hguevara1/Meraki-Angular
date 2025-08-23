import express from "express";
import {
  crearSubreceta,
  obtenerSubrecetas,
  obtenerSubrecetaPorId,
  actualizarSubreceta,
  eliminarSubreceta
} from "../controllers/subreceta.controller.js";

const router = express.Router();

// Rutas para subrecetas
router.post("/", crearSubreceta);          // Crear nueva subreceta
router.get("/", obtenerSubrecetas);        // Obtener todas las subrecetas
router.get("/:id", obtenerSubrecetaPorId); // Obtener una subreceta por ID
router.put("/:id", actualizarSubreceta);   // Actualizar una subreceta
router.delete("/:id", eliminarSubreceta);  // Eliminar una subreceta

export default router;