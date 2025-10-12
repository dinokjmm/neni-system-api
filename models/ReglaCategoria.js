 const mongoose = require('mongoose');

const subcategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },       // Ej: Deportivo
    prefijo: { type: String, required: true, unique: true }, // Ej: ZTD
    categoriaFinal: { type: String }                // Ej: ROPA DAMA
});

const reglaCategoriaSchema = new mongoose.Schema({
    categoriaBase: { type: String, required: true, unique: true }, // Ej: Tops, Zapatos
    subcategorias: [subcategoriaSchema]
});

module.exports = mongoose.model('ReglaCategoria', reglaCategoriaSchema, 'reglasCategorias');