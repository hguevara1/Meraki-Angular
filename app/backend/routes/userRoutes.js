// userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.middleware.js"; // Nuevo middleware

const router = express.Router();

// 🔓 Rutas públicas
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔒 Rutas protegidas - Solo admin puede ver/modificar/eliminar usuarios
router.get("/", authenticateToken, requireAdmin, obtenerUsuarios);
router.get("/:id", authenticateToken, requireAdmin, obtenerUsuario);
router.put("/:id", authenticateToken, requireAdmin, actualizarUsuario);
router.delete("/:id", authenticateToken, requireAdmin, eliminarUsuario);

export default router;