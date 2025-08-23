import Subreceta from "../models/subreceta.model.js";
import Ingrediente from "../models/ingrediente.model.js";

export const crearSubreceta = async (req, res) => {
  try {
    const { nombre, ingredientes } = req.body;

    // Validar que existan ingredientes
    if (!ingredientes || ingredientes.length === 0) {
      return res.status(400).json({ error: "La subreceta debe tener al menos un ingrediente" });
    }

    // Calcular costos automáticamente y validar ingredientes
    const ingredientesConCosto = [];

    for (const ing of ingredientes) {
      // Verificar que el ingrediente existe
      const ingredienteExistente = await Ingrediente.findById(ing.ingrediente);
      if (!ingredienteExistente) {
        return res.status(400).json({ error: `Ingrediente con ID ${ing.ingrediente} no encontrado` });
      }

      // Calcular costo basado en el precio del ingrediente y la cantidad
      let costo = 0;
      if (ingredienteExistente.precio !== null && ingredienteExistente.precio !== undefined) {
        // Calcular el costo unitario por gramo/ml (asumiendo que la medida está en gramos o ml)
        const costoUnitario = ingredienteExistente.precio / ingredienteExistente.medida;
        // Calcular el costo total para la cantidad especificada
        costo = costoUnitario * ing.cantidad;
      }

      ingredientesConCosto.push({
        ingrediente: ing.ingrediente,
        cantidad: ing.cantidad,
        costo: parseFloat(costo.toFixed(2)) // Redondear a 2 decimales
      });
    }

    // Crear la subreceta con los costos calculados
    const subreceta = new Subreceta({
      nombre,
      ingredientes: ingredientesConCosto
    });

    await subreceta.save();

    // Populate para devolver los datos completos del ingrediente
    const subrecetaPopulada = await Subreceta.findById(subreceta._id)
      .populate('ingredientes.ingrediente');

    res.status(201).json(subrecetaPopulada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerSubrecetas = async (req, res) => {
  try {
    const subrecetas = await Subreceta.find()
      .populate('ingredientes.ingrediente');
    res.json(subrecetas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para obtener una subreceta por ID
export const obtenerSubrecetaPorId = async (req, res) => {
  try {
    const subreceta = await Subreceta.findById(req.params.id)
      .populate('ingredientes.ingrediente');

    if (!subreceta) {
      return res.status(404).json({ error: "Subreceta no encontrada" });
    }

    res.json(subreceta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para actualizar una subreceta
export const actualizarSubreceta = async (req, res) => {
  try {
    const { nombre, ingredientes } = req.body;

    // Si se envían ingredientes, recalcular costos
    let datosActualizados = { nombre };

    if (ingredientes) {
      const ingredientesConCosto = [];

      for (const ing of ingredientes) {
        const ingredienteExistente = await Ingrediente.findById(ing.ingrediente);
        if (!ingredienteExistente) {
          return res.status(400).json({ error: `Ingrediente con ID ${ing.ingrediente} no encontrado` });
        }

        let costo = 0;
        if (ingredienteExistente.precio !== null && ingredienteExistente.precio !== undefined) {
          const costoUnitario = ingredienteExistente.precio / ingredienteExistente.medida;
          costo = costoUnitario * ing.cantidad;
        }

        ingredientesConCosto.push({
          ingrediente: ing.ingrediente,
          cantidad: ing.cantidad,
          costo: parseFloat(costo.toFixed(2))
        });
      }

      datosActualizados.ingredientes = ingredientesConCosto;
    }

    const subrecetaActualizada = await Subreceta.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true, runValidators: true }
    ).populate('ingredientes.ingrediente');

    if (!subrecetaActualizada) {
      return res.status(404).json({ error: "Subreceta no encontrada" });
    }

    res.json(subrecetaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controlador para eliminar una subreceta
export const eliminarSubreceta = async (req, res) => {
  try {
    const subrecetaEliminada = await Subreceta.findByIdAndDelete(req.params.id);

    if (!subrecetaEliminada) {
      return res.status(404).json({ error: "Subreceta no encontrada" });
    }

    res.json({ message: "Subreceta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};