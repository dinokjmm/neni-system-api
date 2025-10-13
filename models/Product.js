const mongoose = require('mongoose'); 

const ProductSchema = new mongoose.Schema({
    // CAMPOS DE CLASIFICACIÓN CLAVE
    dueñoSeleccionado: { type: String, required: true }, // Coincide con el campo del frontend
    categoriaBase: { type: String, required: true }, // DAMA, CABALLERO, etc.
    subcategoriaSeleccionada: { type: String, required: true }, // ROPA_INTERIOR, ZAPATOS, etc.

    // CAMPO DE IDENTIFICACIÓN
    codigo: { type: String, required: true, unique: true },

    // CAMPOS DE DETALLES Y STOCK
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 0 }, 
    precio_live: { type: Number, required: true },
    precio_local: { type: Number, required: true },
    
    // CAMPOS DE ESTADO Y VARIOS
    estatus: { 
        type: String, 
        required: true, 
        enum: ['disponible', 'apartado-live', 'vendido-local', 'vendido-live'],
        default: 'disponible'
    },
    tallas: { type: [String] },
    fotos: { type: [String] } 
    
}, { timestamps: true });

// Exportar el modelo
module.exports = mongoose.model('Product', ProductSchema, 'productos');
