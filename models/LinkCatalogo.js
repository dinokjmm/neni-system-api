const mongoose = require('mongoose');

const LinkCatalogoSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: true,
    trim: true
  },

  tipo: {
    type: String,
    required: true,
    enum: ['CATALOGO_CICLO', 'TIENDA_ONLINE']
  },

  nombre: {
    type: String,
    required: true,
    trim: true
  },

  descripcion: {
    type: String,
    default: '',
    trim: true
  },

  url: {
    type: String,
    required: true,
    trim: true
  },

  ciclo: {
    type: String,
    default: '',
    trim: true
  },

  icono: {
    type: String,
    default: '🛍️'
  },

  activo: {
    type: Boolean,
    default: true
  },

  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LinkCatalogo', LinkCatalogoSchema, 'links_catalogo');