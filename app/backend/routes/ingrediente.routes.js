import express from "express";
import {
  crearIngrediente,
  obtenerIngredientesPorNombre,
  obtenerIngredientes,
  obtenerIngrediente,       // ← Agregar
  actualizarIngrediente,    // ← Agregar
  eliminarIngrediente       // ← Agregar (si no existe)
} from "../controllers/ingrediente.controller.js";

const router = express.Router();

console.log("✅ Rutas de ingredientes cargadas"); // ← Log de debug

router.post("/", crearIngrediente);
router.get("/", obtenerIngredientes);
router.get("/:id", (req, res) => {
  console.log("📨 GET /api/ingredientes/:id recibido, ID:", req.params.id); // ← Log
  obtenerIngrediente(req, res);
});
router.put("/:id", actualizarIngrediente);     // ← Nueva ruta
router.delete("/:id", eliminarIngrediente);    // ← Asegurar que existe
router.get("/nombre/:nombre", obtenerIngredientesPorNombre);

export default router;