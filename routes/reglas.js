// ⬅️ CRÍTICO: Importar Express y definir el objeto router
const express = require('express');
const router = express.Router(); 

const ReglaCategoria = require('../models/ReglaCategoria'); // Asegúrate de que la ruta sea correcta

// Ruta GET para obtener todas las reglas de categorización
router.get('/', async (req, res) => {
    try {
        const reglas = await ReglaCategoria.find({});
        res.status(200).json(reglas); // Devuelve todas las reglas
    } catch (error) {
        console.error("Error al obtener reglas:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener reglas de categoría." });
    }
});

// ⬅️ CRÍTICO: Exportar el router
module.exports = router;