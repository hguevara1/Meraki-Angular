import express from "express";
import { crearIngrediente, obtenerIngredientes } from "../controllers/ingrediente.controller.js";

const router = express.Router();

router.post("/", crearIngrediente);
router.get("/", obtenerIngredientes);

export default router;
