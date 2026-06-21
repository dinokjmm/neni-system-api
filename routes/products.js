const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const ReglaCategoria = require('../models/ReglaCategoria');

console.log('✅ Archivo routes/products cargado correctamente');

// ----------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Escapar texto para usarlo dentro de RegExp
// ----------------------------------------------------------------------
const escapeRegExp = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ----------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Obtiene el siguiente número de secuencia

// ----------------------------------------------------------------------
const getNextSecuencia = async (prefijoCompleto) => {
  try {
    const prefijoSeguro = escapeRegExp(prefijoCompleto);

    const lastProduct = await Product.findOne({
      codigo: new RegExp(`^${prefijoSeguro}-\\d{4}$`)
    })
      .sort({ codigo: -1 })
      .limit(1);

    let nextNumber = 1;

    if (lastProduct && lastProduct.codigo) {
      const parts = lastProduct.codigo.split('-');
      const lastNumberString = parts[parts.length - 1];
      const lastNumber = parseInt(lastNumberString, 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return String(nextNumber).padStart(4, '0');
  } catch (error) {
    throw new Error(`Fallo en la consulta de secuencia de código: ${error.message}`);
  }
};

// ----------------------------------------------------------------------
// RUTA DE DIAGNÓSTICO
// Sirve para saber si está leyendo la BD y colección correctas
// ----------------------------------------------------------------------
router.get('/diagnostico', async (req, res) => {
  try {
    const total = await Product.countDocuments({});

    const ejemplos = await Product.find({})
      .select('codigo estatus descripcion categoriaBase subcategoriaSeleccionada dueñoSeleccionado createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      message: 'Diagnóstico de productos',
      database: Product.db.name,
      collection: Product.collection.name,
      totalProductos: total,
      ejemplos
    });
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    res.status(500).json({
      message: 'Error al ejecutar diagnóstico.',
      detail: error.message
    });
  }
});

// ----------------------------------------------------------------------
// GET: Catálogo Público
// Trae productos disponibles aunque el estatus venga con variantes
// ----------------------------------------------------------------------
router.get('/catalogo', async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { estatus: { $regex: 'disponible-publico', $options: 'i' } },
        { estatus: { $regex: 'disponible publico', $options: 'i' } },
        { estatus: { $regex: 'disponible_público', $options: 'i' } },
        { estatus: { $regex: 'disponible', $options: 'i' } },
        { estatus: { $regex: 'publico', $options: 'i' } },
        { estatus: { $regex: 'público', $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener el catálogo:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener catálogo.',
      detail: error.message
    });
  }
});

// ----------------------------------------------------------------------
// GET: Trae absolutamente todo de la colección
// ----------------------------------------------------------------------
router.get('/todos', async (req, res) => {
  try {
    const allProducts = await Product.find({}).sort({ createdAt: -1 });
    res.json(allProducts);
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener todos los productos.',
      detail: error.message
    });
  }
});

// ----------------------------------------------------------------------
// POST: Registro automatizado / manual
// ----------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      dueñoSeleccionado,
      categoriaBase,
      subcategoriaSeleccionada,
      codigo,
      ...rest
    } = req.body;

    let datosProducto;
    let finalCode = codigo ? String(codigo).trim() : '';

    // ------------------------------------------------------------------
    // CASO 1: Código manual
    // ------------------------------------------------------------------
    if (finalCode !== '') {
      console.log(`Usando código manual: ${finalCode}`);

      datosProducto = {
        dueñoSeleccionado,
        categoriaBase,
        subcategoriaSeleccionada,
        ...rest,
        codigo: finalCode
      };
    } else {
      // ------------------------------------------------------------------
      // CASO 2: Código automático
      // ------------------------------------------------------------------
      console.log('Generando código automáticamente...');

      if (!dueñoSeleccionado || !categoriaBase || !subcategoriaSeleccionada) {
        return res.status(400).json({
          message: 'Faltan campos de categorización: dueño, categoría base o subcategoría.'
        });
      }

      const reglas = await ReglaCategoria.findOne({
        categoriaBase: categoriaBase
      });

      if (!reglas) {
        return res.status(400).json({
          message: 'Categoría base no encontrada. Revisa las reglas en MongoDB Atlas.'
        });
      }

      const subregla = reglas.subcategorias.find(
        s => s.nombre === subcategoriaSeleccionada
      );

      if (!subregla) {
        return res.status(400).json({
          message: 'Subcategoría no válida o no encontrada en las reglas.'
        });
      }

      const prefijoSubcategoria = subregla.prefijo;
      const categoriaPrefijo = categoriaBase[0];

      const prefijoCompacto = `${categoriaPrefijo}${prefijoSubcategoria}`;
      const prefijoCompleto = `${dueñoSeleccionado}-${prefijoCompacto}`;

      const secuencia = await getNextSecuencia(prefijoCompleto);

      finalCode = `${prefijoCompleto}-${secuencia}`;

      datosProducto = {
        dueñoSeleccionado,
        categoriaBase,
        subcategoriaSeleccionada,
        ...rest,
        codigo: finalCode
      };
    }

    const nuevoProducto = new Product(datosProducto);
    await nuevoProducto.save();

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al registrar producto:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación: faltan campos requeridos o algún dato no cumple el modelo.',
        errors: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'El código del producto ya existe. Usa otro código.',
        detail: error.keyValue
      });
    }

    res.status(500).json({
      message: 'Error en el servidor al guardar el producto.',
      detail: error.message
    });
  }
});

module.exports = router;