import express from "express";
import {
  registerUser,
  loginUser,
  obtenerUsuarios,      // Cambiado de obtenerClientes
  obtenerUsuario,       // Cambiado de obtenerCliente
  actualizarUsuario,    // Cambiado de actualizarCliente
  eliminarUsuario       // Cambiado de eliminarCliente
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", obtenerUsuarios);          // Cambiado
router.get("/:id", obtenerUsuario);        // Cambiado
router.put("/:id", actualizarUsuario);     // Cambiado
router.delete("/:id", eliminarUsuario);    // Cambiado

export default router;