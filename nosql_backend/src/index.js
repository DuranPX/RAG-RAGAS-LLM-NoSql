require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {

  app.get('/api/health', async (req, res) => {
    try {
      const db = getDB();
      const colecciones = await db.listCollections().toArray().then(cols => cols.map(c => c.name));
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        servidor: 'API REST - Sistema RAG NoSQL Spotify',
        version: '1.0.0',
        base_datos: {
          motor: 'MongoDB Atlas',
          conectada: true,
          nombre: db.databaseName,
          colecciones
        },
        modelos: ['canciones', 'chunks']
      });
    } catch (error) {
      return res.status(503).json({
        status: 'error',
        mensaje: 'Base de datos no disponible',
        detalle: error.message
      });
    }
  });

  app.get('/', (req, res) => {
    res.json({
      mensaje: '🎵 API RAG - Plataforma Musical Inteligente',
      endpoints: { health: 'GET /api/health' }
    });
  });

  app.use((req, res) => {
    res.status(404).json({ status: 'error', mensaje: 'Ruta no encontrada' });
  });

  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  });

  app.listen(PORT, () => {
    console.log('🚀 Servidor corriendo en http://localhost:' + PORT);
    console.log('🏥 Health: http://localhost:' + PORT + '/api/health');
  });

}).catch(err => {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});

module.exports = app;
