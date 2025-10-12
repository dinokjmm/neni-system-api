// routes/reglas.js (o al inicio de routes/products.js si prefieres centralizar)

// Asegúrate de importar tu modelo
const ReglaCategoria = require('../models/ReglaCategoria'); 

// ... Si estás usando un Router de Express
router.get('/reglas', async (req, res) => {
    try {
        const reglas = await ReglaCategoria.find({});
        res.status(200).json(reglas); // Devuelve todas las reglas
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reglas de categoría." });
    }
});
// ... Asegúrate de exportar este router