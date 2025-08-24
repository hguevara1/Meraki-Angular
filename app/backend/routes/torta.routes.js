import express from "express";
import Torta from "../models/torta.model.js";

const router = express.Router();

// GET todas las tortas
router.get("/", async (req, res) => {
  try {
    const tortas = await Torta.find().populate('subrecetas');
    res.json(tortas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET torta por ID
router.get("/:id", async (req, res) => {
  try {
    const torta = await Torta.findById(req.params.id).populate('subrecetas');
    res.json(torta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear torta
router.post("/", async (req, res) => {
  try {
    const torta = new Torta(req.body);
    await torta.save();
    await torta.populate('subrecetas');
    res.status(201).json(torta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT actualizar torta
router.put("/:id", async (req, res) => {
  try {
    const torta = await Torta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subrecetas');
    res.json(torta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE eliminar torta
router.delete("/:id", async (req, res) => {
  try {
    await Torta.findByIdAndDelete(req.params.id);
    res.json({ message: "Torta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;