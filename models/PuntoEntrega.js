const mongoose = require('mongoose');

const puntoEntregaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  referencia: {
    type: String,
    trim: true
  },
  zona: {
    type: String,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['PUNTO_ENTREGA', 'DOMICILIO'],
    default: 'PUNTO_ENTREGA'
  },
  dias: {
    type: [String],
    default: []
  },
  horarioTexto: {
    type: String,
    trim: true
  },
  horaInicio: {
    type: String,
    trim: true
  },
  horaFin: {
    type: String,
    trim: true
  },
  costo: {
    type: Number,
    default: 0
  },
  costoDesde: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  notas: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'puntosEntrega'
});

module.exports = mongoose.model('PuntoEntrega', puntoEntregaSchema);