import Subreceta from "../models/subreceta.model.js";

export const crearSubreceta = async (req, res) => {
  try {
    const subreceta = new Subreceta(req.body);
    await subreceta.save();
    res.status(201).json(subreceta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerSubrecetas = async (req, res) => {
  try {
    const subrecetas = await Subreceta.find();
    res.json(subrecetas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
