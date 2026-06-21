const express = require('express');
const router = express.Router();

const LinkCatalogo = require('../models/LinkCatalogo');

// Obtener links activos para el catálogo público
router.get('/activos', async (req, res) => {
  try {
    const links = await LinkCatalogo.find({ activo: true })
      .sort({ tipo: 1, orden: 1, createdAt: -1 });

    res.json(links);
  } catch (error) {
    console.error('Error al obtener links de catálogo:', error);

    res.status(500).json({
      message: 'Error al obtener links de catálogo.',
      detail: error.message
    });
  }
});

// Crear link
router.post('/', async (req, res) => {
  try {
    const nuevoLink = new LinkCatalogo(req.body);
    const linkGuardado = await nuevoLink.save();

    res.status(201).json(linkGuardado);
  } catch (error) {
    console.error('Error al crear link de catálogo:', error);

    res.status(400).json({
      message: 'Error al crear link de catálogo.',
      detail: error.message
    });
  }
});

// Actualizar link
router.put('/:id', async (req, res) => {
  try {
    const linkActualizado = await LinkCatalogo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!linkActualizado) {
      return res.status(404).json({
        message: 'Link no encontrado.'
      });
    }

    res.json(linkActualizado);
  } catch (error) {
    console.error('Error al actualizar link de catálogo:', error);

    res.status(400).json({
      message: 'Error al actualizar link de catálogo.',
      detail: error.message
    });
  }
});

// Desactivar link
router.delete('/:id', async (req, res) => {
  try {
    const linkDesactivado = await LinkCatalogo.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!linkDesactivado) {
      return res.status(404).json({
        message: 'Link no encontrado.'
      });
    }

    res.json({
      message: 'Link desactivado correctamente.',
      link: linkDesactivado
    });
  } catch (error) {
    console.error('Error al desactivar link:', error);

    res.status(500).json({
      message: 'Error al desactivar link.',
      detail: error.message
    });
  }
});

module.exports = router;