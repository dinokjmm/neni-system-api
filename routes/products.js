const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Modelo de Producto
const ReglaCategoria = require('../models/ReglaCategoria'); // Modelo de Reglas

// ----------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene el siguiente número de secuencia para el prefijo COMPLETO
// ----------------------------------------------------------------------
// Se ajustó para buscar por el prefijo completo (Ej: Z-DRI) y usar 4 dígitos.
const getNextSecuencia = async (prefijoCompleto) => {
 try {
  // Busca el producto con el código más alto que empiece con el prefijo completo
  // Búsqueda: ^Z-DRI-\d{4}$ (4 dígitos al final)
  const lastProduct = await Product.findOne({
   codigo: new RegExp(`^${prefijoCompleto}-\\d{4}$`) 
  }).sort({ codigo: -1 }).limit(1);

  let nextNumber = 1;

  if (lastProduct) {
   // Extrae el número de secuencia (Ej: de "Z-DRI-0005" obtiene 5)
   const lastCode = lastProduct.codigo;
   
   // Separa el código por el último guion para obtener la secuencia
      const parts = lastCode.split('-');
      const lastNumberString = parts[parts.length - 1]; // Obtiene "0005"
      const lastNumber = parseInt(lastNumberString, 10); // Obtiene 5
   
   nextNumber = lastNumber + 1;
  }
  
  // Formatea el número a 4 dígitos (Ej: 1 -> "0001")
  return String(nextNumber).padStart(4, '0');
  
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
// RUTA POST: REGISTRO AUTOMATIZADO / MANUAL
// ----------------------------------------------------------------------
router.post('/', async (req, res) => {
 try {
  // ⬅️ Paso CRÍTICO: Recibimos todos los campos, incluyendo 'codigo' si se proporcionó manualmente
  const { 
      dueñoSeleccionado, 
      categoriaBase, 
      subcategoriaSeleccionada, 
      codigo, // <-- Capturamos el código si fue ingresado manualmente
      ...rest // El resto de campos (descripcion, precios, etc.)
    } = req.body; 

    let datosProducto;
        let finalCode = codigo; // Usará el código manual si existe (o será undefined)

        // ----------------------------------------------------------------------
        // LÓGICA DE CÓDIGO
        // ----------------------------------------------------------------------

    if (finalCode && finalCode.trim() !== '') {
            // Caso 1: Código manual provisto. Usar el código tal cual.
            console.log(`Usando código manual: ${finalCode}`);

            datosProducto = {
        dueñoSeleccionado, 
        categoriaBase,
        subcategoriaSeleccionada,
                ...rest, 
        codigo: finalCode, // Usar el código manual proporcionado
            };
            
        } else {
            // Caso 2: Código NO provisto. Aplicar la regla de generación automática.
            console.log('Generando código automáticamente...');

            // Se valida que existan los campos necesarios para la generación automática
            if (!dueñoSeleccionado || !categoriaBase || !subcategoriaSeleccionada) {
                 return res.status(400).json({ message: "Faltan campos de categorización (dueño, categoría base, subcategoría) requeridos para la generación automática de código." });
            }

            // 1. VALIDACIÓN y OBTENCIÓN DE PREFIJOS
            const reglas = await ReglaCategoria.findOne({ categoriaBase: categoriaBase });
            
            if (!reglas) {
                return res.status(400).json({ message: "Categoría base no encontrada. Revisa las reglas en MongoDB Atlas." });
            }
            
            const subregla = reglas.subcategorias.find(s => s.nombre === subcategoriaSeleccionada);
            
            if (!subregla) {
                return res.status(400).json({ message: "Subcategoría no válida o no encontrada en las reglas." });
            }

            // Prefijos para construir el código
            const prefijoSubcategoria = subregla.prefijo; // Ej: RI
            const categoriaPrefijo = categoriaBase[0]; // Ej: D
            
            // Prefijo Compacto: Ej: DRI (D + RI)
            const prefijoCompacto = `${categoriaPrefijo}${prefijoSubcategoria}`;
            
            // Prefijo Completo (para buscar la secuencia): Ej: Z-DRI
            const prefijoCompleto = `${dueñoSeleccionado}-${prefijoCompacto}`;
            
            // 2. GENERAR LA SECUENCIA (Usando el prefijo completo para unicidad)
            const secuencia = await getNextSecuencia(prefijoCompleto); 
            
            // 3. CONSTRUIR EL CÓDIGO FINAL AUTOMÁTICO
            finalCode = `${prefijoCompleto}-${secuencia}`;
            
            // 4. CONSTRUIR EL OBJETO FINAL (Automático)
            datosProducto = {
        dueñoSeleccionado, 
        categoriaBase,
        subcategoriaSeleccionada,
                ...rest, // El resto de la data (descripcion, cantidad, precios, etc.)
        codigo: finalCode, // <-- Código generado
            };
        }
  
  // 5. CREAR y GUARDAR
  const nuevoProducto = new Product(datosProducto); 
  await nuevoProducto.save(); 
  
  res.status(201).json(nuevoProducto);
 } catch (error) {
  console.error("Error al registrar producto:", error);
  
  // Manejo de errores de validación de Mongoose
  if (error.name === 'ValidationError') {
   return res.status(400).json({ 
        message: "Error de validación: faltan campos requeridos o el código es duplicado.", 
        errors: error.errors 
      });
  }

  // Si la secuencia falló o fue otro error 500
  res.status(500).json({ 
   message: "Error en el servidor al guardar el producto.",
   detail: error.message 
  });
 }
});

module.exports = router;
