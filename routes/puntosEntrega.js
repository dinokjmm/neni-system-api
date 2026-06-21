const express = require('express');
const router = express.Router();

const PuntoEntrega = require('../models/PuntoEntrega');

// Obtener todos los puntos de entrega
router.get('/', async (req, res) => {
  try {
    const puntos = await PuntoEntrega.find()
      .sort({ nombre: 1 });

    res.json(puntos);
  } catch (error) {
    console.error('Error al obtener puntos de entrega:', error);
    res.status(500).json({ message: 'Error al obtener puntos de entrega' });
  }
});

// Obtener solo puntos activos
router.get('/activos', async (req, res) => {
  try {
    const puntos = await PuntoEntrega.find({ activo: true })
      .sort({ nombre: 1 });

    res.json(puntos);
  } catch (error) {
    console.error('Error al obtener puntos activos:', error);
    res.status(500).json({ message: 'Error al obtener puntos activos' });
  }
});

// Buscar por tipo: PUNTO_ENTREGA o DOMICILIO
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const puntos = await PuntoEntrega.find({
      tipo: req.params.tipo
    }).sort({ nombre: 1 });

    res.json(puntos);
  } catch (error) {
    console.error('Error al buscar puntos por tipo:', error);
    res.status(500).json({ message: 'Error al buscar puntos por tipo' });
  }
});

// Crear punto de entrega
router.post('/', async (req, res) => {
  try {
    const nuevoPunto = new PuntoEntrega(req.body);
    const guardado = await nuevoPunto.save();

    res.status(201).json(guardado);
  } catch (error) {
    console.error('Error al crear punto de entrega:', error);
    res.status(500).json({ message: 'Error al crear punto de entrega' });
  }
});

// Actualizar punto de entrega
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await PuntoEntrega.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: 'Punto de entrega no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar punto de entrega:', error);
    res.status(500).json({ message: 'Error al actualizar punto de entrega' });
  }
});

// Eliminar punto de entrega
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await PuntoEntrega.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Punto de entrega no encontrado' });
    }

    res.json({ message: 'Punto de entrega eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar punto de entrega:', error);
    res.status(500).json({ message: 'Error al eliminar punto de entrega' });
  }
});

module.exports = router;