const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Modelo de Producto
const ReglaCategoria = require('../models/ReglaCategoria'); // ⬅️ Nuevo Modelo de Reglas

// ----------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene el siguiente número de secuencia para el prefijo
// ----------------------------------------------------------------------
const getNextSecuencia = async (prefijo) => {
    try {
        // Busca el producto con el código más alto que empiece con el prefijo
        const lastProduct = await Product.findOne({
            codigo: new RegExp(`^${prefijo}-\\d{3}$`) 
        }).sort({ codigo: -1 }).limit(1);

        let nextNumber = 1;

        if (lastProduct) {
            // Extrae el número de secuencia (Ej: de "ZTD-005" obtiene 5)
            const lastCode = lastProduct.codigo;
            // Manejo defensivo: si no encuentra el '-', usa 000 + 1
            const lastNumberString = lastCode.split('-')[1] || "000"; 
            const lastNumber = parseInt(lastNumberString, 10);
            
            nextNumber = lastNumber + 1;
        }
        
        // Formatea el número a 3 dígitos (Ej: 1 -> "001")
        return String(nextNumber).padStart(3, '0');
        
    } catch (error) {
        // Lanza un error para que el try/catch principal lo capture
        throw new Error(`Fallo en la consulta de secuencia de código: ${error.message}`);
    }
};

// ----------------------------------------------------------------------
// RUTAS GET (Mantenidas)
// ----------------------------------------------------------------------

// RUTA 1: Obtener el Catálogo Público (SOLO DISPONIBLES)
router.get('/catalogo', async (req, res) => {
    try {
        const products = await Product.find({
            estatus: { $regex: 'disponible', $options: 'i' } 
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
        const allProducts = await Product.find({}); 
        res.json(allProducts);
    } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// ----------------------------------------------------------------------
// RUTA POST: REGISTRO AUTOMATIZADO (La única ruta POST)
// ----------------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        // ⬅️ Recibimos las claves de categorización del frontend
        const { categoriaBase, subcategoriaSeleccionada, ...rest } = req.body; 

        // 1. OBTENER REGLAS Y PREFIJO
        const reglas = await ReglaCategoria.findOne({ categoriaBase: categoriaBase });
        
        if (!reglas) {
            return res.status(400).json({ message: "Categoría base no encontrada. Revisa las reglas en MongoDB Atlas." });
        }
        
        const subregla = reglas.subcategorias.find(s => s.nombre === subcategoriaSeleccionada);
        
        if (!subregla) {
             return res.status(400).json({ message: "Subcategoría no válida o no encontrada en las reglas." });
        }

        const prefijo = subregla.prefijo; 
        
        // 2. GENERAR LA SECUENCIA
        const secuencia = await getNextSecuencia(prefijo); 
        
        // 3. CONSTRUIR EL OBJETO FINAL (AQUÍ SE CREA EL CÓDIGO)
        const datosProducto = {
            ...rest,
            codigo: `${prefijo}-${secuencia}`, // ⬅️ CÓDIGO GENERADO
            categoria: subregla.categoriaFinal, // ⬅️ Categoría final de la BD
            subcategoria: subcategoriaSeleccionada.toUpperCase()
        };
        
        // 4. CREAR y GUARDAR
        const nuevoProducto = new Product(datosProducto); 
        await nuevoProducto.save(); // ¡Ahora el código existe y pasa la validación!
        
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error("Error al registrar producto:", error);
        
        // Manejo de errores de validación de Mongoose (para mostrar mensajes claros)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: error.message, errors: error.errors });
        }

        // Si la secuencia falló o fue otro error 500
        res.status(500).json({ 
            message: "Error en el servidor al guardar el producto.",
            detail: error.message 
        });
    }
});

module.exports = router;