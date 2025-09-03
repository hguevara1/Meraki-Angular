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

const router = express.Router();

// 🔓 Rutas públicas
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔒 Rutas protegidas
router.get("/", authenticateToken, obtenerUsuarios);
router.get("/:id", authenticateToken, obtenerUsuario);
router.put("/:id", authenticateToken, actualizarUsuario);
router.delete("/:id", authenticateToken, eliminarUsuario);

export default router;
