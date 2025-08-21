import express from "express";
import { crearTorta, obtenerTortas } from "../controllers/torta.controller.js";

const router = express.Router();

router.post("/", crearTorta);
router.get("/", obtenerTortas);

export default router;
