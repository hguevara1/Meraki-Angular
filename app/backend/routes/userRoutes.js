import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas aquí están protegidas con JWT
router.get("/", authenticateToken, obtenerUsuarios);
router.get("/:id", authenticateToken, obtenerUsuario);
router.put("/:id", authenticateToken, actualizarUsuario);
router.delete("/:id", authenticateToken, eliminarUsuario);

export default router;
