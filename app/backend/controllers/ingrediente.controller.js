import Ingrediente from "../models/ingrediente.model.js";

export const crearIngrediente = async (req, res) => {
  try {
    const ingrediente = new Ingrediente(req.body);
    await ingrediente.save();
    res.status(201).json(ingrediente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: `El ingrediente "${req.body.nombre}" ya existe`
      });
    }
    res.status(400).json({
      message: "Error al crear ingrediente",
      error: error.message
    });
  }
};

export const obtenerIngredientes = async (req, res) => {
  try {
    const ingredientes = await Ingrediente.find().sort({ nombre: 1 });
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ingredientes",
      error: error.message
    });
  }
};