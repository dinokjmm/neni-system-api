// server.js

// 1. Cargar variables de entorno (MongoDB URI)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000; 

// 2. Middleware
// Configuración de CORS: Permite a CUALQUIER frontend acceder a la API
app.use(cors({
    origin: '*', // Esto es temporal. Significa 'cualquier dominio'.
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json()); // Permite recibir datos en formato JSON
// 4. Importar Rutas
const productRoutes = require('./routes/products');
app.use('/api/productos', productRoutes); 

// 3. Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conexión a MongoDB Atlas exitosa.'))
    .catch(err => console.error('❌ Error de conexión:', err));

// 4. Ruta Raíz (solo para verificar que el servidor funciona)
app.get('/', (req, res) => {
    res.send('API del Neni-System Activa.');
});

// 5. Iniciar el Servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});