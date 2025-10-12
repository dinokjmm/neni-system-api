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
 origin: '*', 
 methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json()); // Permite recibir datos en formato JSON

// 3. Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log('✅ Conexión a MongoDB Atlas exitosa.'))
 .catch(err => console.error('❌ Error de conexión:', err));

// 4. Importar Rutas y Configuración
const productRoutes = require('./routes/products');
// ⬅️ NUEVA IMPORTACIÓN: Asegúrate de que el nombre y la ruta sean correctos
const reglasRoutes = require('./routes/reglas'); 


// Usar rutas de productos
app.use('/api/productos', productRoutes); 

// ⬅️ NUEVA CONFIGURACIÓN: EXPONER LA RUTA /api/reglas
app.use('/api/reglas', reglasRoutes);


// 5. Ruta Raíz (solo para verificar que el servidor funciona)
app.get('/', (req, res) => {
 res.send('API del Neni-System Activa.');
});

// 6. Iniciar el Servidor
app.listen(port, () => {
 console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});