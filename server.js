// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// 1. Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// 2. Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conexión a MongoDB Atlas exitosa.');
    console.log('📌 Base de datos conectada:', mongoose.connection.name);
  })
  .catch(err => console.error('❌ Error de conexión:', err));

// 3. Importar rutas
const productRoutes = require('./routes/products');
const reglasRoutes = require('./routes/reglas');
const linksCatalogoRoutes = require('./routes/linksCatalogo');

const zonasEntregaRoutes = require('./routes/zonasEntrega');
const puntosEntregaRoutes = require('./routes/puntosEntrega');

// 4. Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/reglas', reglasRoutes);
app.use('/api/links-catalogo', linksCatalogoRoutes);
app.use('/api/zonas-entrega', zonasEntregaRoutes);
app.use('/api/puntos-entrega', puntosEntregaRoutes);

// 5. Ruta raíz
app.get('/', (req, res) => {
  res.send('API del Neni-System Activa.');
});

// 6. Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});