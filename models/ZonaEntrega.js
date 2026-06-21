const mongoose = require('mongoose');

const zonaEntregaSchema = new mongoose.Schema({
  codigoPostal: {
    type: String,
    required: true,
    trim: true
  },
  colonias: {
    type: [String],
    default: []
  },
  municipio: {
    type: String,
    default: 'Querétaro',
    trim: true
  },
  estado: {
    type: String,
    default: 'Querétaro',
    trim: true
  },
  direccionGeneral: {
    type: String,
    trim: true
  },
  zona: {
    type: String,
    trim: true
  },
  categoriaDistancia: {
    type: String,
    trim: true
  },
  costoGasolinaEstimado: {
    type: Number,
    default: 0
  },
  costoEntrega: {
    type: Number,
    default: 50
  },
  moneda: {
    type: String,
    default: 'MXN'
  },
  baseCalculo: {
    type: String,
    trim: true
  },
  notas: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'zonasEntrega'
});

module.exports = mongoose.model('ZonaEntrega', zonaEntregaSchema);