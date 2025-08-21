import express from "express";
import { crearSubreceta, obtenerSubrecetas } from "../controllers/subreceta.controller.js";

const router = express.Router();

router.post("/", crearSubreceta);
router.get("/", obtenerSubrecetas);

export default router;
