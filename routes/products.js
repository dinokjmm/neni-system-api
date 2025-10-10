// routes/products.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa el modelo

// RUTA 1: Obtener el Catálogo Público (SOLO DISPONIBLES)
router.get('/catalogo', async (req, res) => {
    try {
        // Lógica de filtrado: solo muestra lo que no está vendido o apartado
        const products = await Product.find({
            estatus: { $regex: 'disponible', $options: 'i' } // Acepta "Disponible", "DISPONIBLE", etc.
        }).sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error('Error al obtener el catálogo:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// RUTA DE PRUEBA: Trae ABSOLUTAMENTE TODO de la colección
router.get('/todos', async (req, res) => {
    try {
        const allProducts = await Product.find({}); // El objeto vacío {} trae todo
        res.json(allProducts);
    } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// RUTA 2 (CRUD Básico): Cargar un nuevo producto (Para tu Panel de Admin)
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;