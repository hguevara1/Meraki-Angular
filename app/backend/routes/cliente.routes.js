import express from "express";
import {
  crearCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente
} from "../controllers/cliente.controller.js";

const router = express.Router();

router.post("/", crearCliente);
router.get("/", obtenerClientes);
router.get("/:id", obtenerCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

export default router;
