const express = require('express');
const router = express.Router();

const ZonaEntrega = require('../models/ZonaEntrega');

// Obtener todas las zonas
router.get('/', async (req, res) => {
  try {
    const zonas = await ZonaEntrega.find()
      .sort({ codigoPostal: 1 });

    res.json(zonas);
  } catch (error) {
    console.error('Error al obtener zonas de entrega:', error);
    res.status(500).json({ message: 'Error al obtener zonas de entrega' });
  }
});

// Obtener solo zonas activas
router.get('/activas', async (req, res) => {
  try {
    const zonas = await ZonaEntrega.find({ activo: true })
      .sort({ codigoPostal: 1 });

    res.json(zonas);
  } catch (error) {
    console.error('Error al obtener zonas activas:', error);
    res.status(500).json({ message: 'Error al obtener zonas activas' });
  }
});

// Cotizar envío por código postal
router.get('/cotizar', async (req, res) => {
  try {
    const codigoPostal = String(req.query.codigoPostal || '').trim();

    if (!codigoPostal || codigoPostal.length !== 5) {
      return res.status(400).json({
        encontrado: false,
        mensaje: 'Código postal inválido'
      });
    }

    const zona = await ZonaEntrega.findOne({
      codigoPostal: codigoPostal
    });

    if (!zona) {
      return res.status(404).json({
        encontrado: false,
        codigoPostal,
        mensaje: 'No se encontró el CP. Se cotiza por WhatsApp.'
      });
    }

    res.json({
      encontrado: true,
      codigoPostal: zona.codigoPostal,
      colonias: zona.colonias || [],
      municipio: zona.municipio,
      estado: zona.estado,
      direccionGeneral: zona.direccionGeneral,
      zona: zona.zona,
      categoriaDistancia: zona.categoriaDistancia,
      costoGasolinaEstimado: zona.costoGasolinaEstimado || 0,
      costoEntrega: zona.costoEntrega || 50,
      moneda: zona.moneda || 'MXN',
      activo: zona.activo,
      notas: zona.notas
    });
  } catch (error) {
    console.error('Error al cotizar envío:', error);
    res.status(500).json({
      encontrado: false,
      mensaje: 'Error al cotizar envío'
    });
  }
});

// Buscar por código postal
router.get('/cp/:codigoPostal', async (req, res) => {
  try {
    const zona = await ZonaEntrega.findOne({
      codigoPostal: req.params.codigoPostal
    });

    if (!zona) {
      return res.status(404).json({
        message: 'No se encontró zona para ese código postal'
      });
    }

    res.json(zona);
  } catch (error) {
    console.error('Error al buscar zona por código postal:', error);
    res.status(500).json({ message: 'Error al buscar zona por código postal' });
  }
});

// Crear zona
router.post('/', async (req, res) => {
  try {
    const nuevaZona = new ZonaEntrega(req.body);
    const guardada = await nuevaZona.save();

    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear zona de entrega:', error);
    res.status(500).json({ message: 'Error al crear zona de entrega' });
  }
});

// Actualizar zona
router.put('/:id', async (req, res) => {
  try {
    const actualizada = await ZonaEntrega.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Zona no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({ message: 'Error al actualizar zona' });
  }
});

// Eliminar zona
router.delete('/:id', async (req, res) => {
  try {
    const eliminada = await ZonaEntrega.findByIdAndDelete(req.params.id);

    if (!eliminada) {
      return res.status(404).json({ message: 'Zona no encontrada' });
    }

    res.json({ message: 'Zona eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar zona:', error);
    res.status(500).json({ message: 'Error al eliminar zona' });
  }
});

module.exports = router;