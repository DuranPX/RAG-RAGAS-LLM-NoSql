// =============================================================
// index.js — Punto de entrada del servidor Express
// Setup inicial de la API REST
// =============================================================

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares base ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); // límite alto para payloads con embeddings
app.use(express.urlencoded({ extended: true }));

// --- Conectar a MongoDB ---
connectDB();

// =============================================================
// GET /api/health
// Endpoint de salud del servidor y la base de datos
// Equivalente al SELECT 1 que se usaba para verificar pg en SQL
// =============================================================
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');

  // Estado de la conexión de Mongoose
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const estadoConexion = mongoose.connection.readyState;
  const estadoTexto = ['desconectado', 'conectado', 'conectando', 'desconectando'];

  const dbConectada = estadoConexion === 1;

  // Verificar colecciones existentes (equivalente a pg_stat_user_tables)
  let colecciones = [];
  if (dbConectada) {
    try {
      colecciones = await mongoose.connection.db
        .listCollections()
        .toArray()
        .then(cols => cols.map(c => c.name));
    } catch (e) {
      colecciones = ['error al listar colecciones'];
    }
  }

  const payload = {
    status:     dbConectada ? 'ok' : 'error',
    timestamp:  new Date().toISOString(),
    servidor:   'API REST - Sistema RAG NoSQL Spotify',
    version:    '1.0.0',
    base_datos: {
      motor:      'MongoDB Atlas',
      estado:     estadoTexto[estadoConexion],
      conectada:  dbConectada,
      nombre:     mongoose.connection.name || 'spotifyRAG',
      host:       mongoose.connection.host || 'cluster0.sf3nhqw.mongodb.net',
      // colecciones equivalentes a las tablas del SQL original
      colecciones
    },
    modelos_cargados: ['Song (canciones)', 'Chunk (chunks)']
  };

  return res.status(dbConectada ? 200 : 503).json(payload);
});

// --- Ruta raíz informativa ---
app.get('/', (req, res) => {
  res.json({
    mensaje:   '🎵 API RAG - Plataforma Musical Inteligente',
    endpoints: {
      health:  'GET /api/health',
      docs:    'Ver README.md para el resto de endpoints'
    }
  });
});

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    mensaje: `Ruta ${req.method} ${req.path} no encontrada`
  });
});

// --- Manejo global de errores ---
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({
    status:  'error',
    mensaje: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- Arrancar servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;