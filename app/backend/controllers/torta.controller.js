import Torta from "../models/torta.model.js";

export const crearTorta = async (req, res) => {
  try {
    const torta = new Torta(req.body);
    await torta.save();
    res.status(201).json(torta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerTortas = async (req, res) => {
  try {
    const tortas = await Torta.find().populate("subrecetas");
    res.json(tortas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
