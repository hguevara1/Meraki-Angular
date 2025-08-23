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

export const obtenerIngredientesPorNombre = async (req, res) => {
  try {
    const ingredientes = await Ingrediente.find({
      nombre: { $regex: req.params.nombre, $options: 'i' }
    });

    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar ingredientes", error: error.message });
  }
};
export const obtenerIngrediente = async (req, res) => {
  try {
    const ingrediente = await Ingrediente.findById(req.params.id);
    if (!ingrediente) {
      return res.status(404).json({ message: "Ingrediente no encontrado" });
    }
    res.json(ingrediente);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ingrediente", error: error.message });
  }
};

// Actualizar ingrediente
export const actualizarIngrediente = async (req, res) => {
  try {
    const ingrediente = await Ingrediente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ingrediente) {
      return res.status(404).json({ message: "Ingrediente no encontrado" });
    }
    res.json(ingrediente);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar ingrediente", error: error.message });
  }
};

// Eliminar ingrediente
export const eliminarIngrediente = async (req, res) => {
  try {
    const ingrediente = await Ingrediente.findByIdAndDelete(req.params.id);
    if (!ingrediente) {
      return res.status(404).json({ message: "Ingrediente no encontrado" });
    }
    res.json({ message: "Ingrediente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar ingrediente", error: error.message });
  }
};