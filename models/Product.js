const mongoose = require('mongoose'); 

const ProductSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    categoria: { type: String },
    precio_live: { type: Number, required: true },
    precio_local: { type: Number, required: true },
    categoria: { type: String, required: true }, 

    // ⬅️ AGREGAR ESTE CAMPO DE CANTIDAD/STOCK
    cantidad: { type: Number, required: true, min: 0 }, 
    estatus: { 
        type: String, 
        required: true, 
        enum: ['disponible', 'apartado-live', 'vendido-local', 'vendido-live'],
        default: 'disponible'
    },
    tallas: { type: [String] },
    fotos: { type: [String] }, 
    owner: { type: String }    
}, { timestamps: true });

// Exportar el modelo
module.exports = mongoose.model('Product', ProductSchema, 'productos'); 
