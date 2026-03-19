// =============================================================
// db.js — Conexión a MongoDB Atlas
// Equivalente NoSQL de la configuración de conexión a PostgreSQL
//
// En el modelo SQL se usaba pg (node-postgres) con pool de conexiones.
// En MongoDB se usa Mongoose con reconexión automática.
// =============================================================

const mongoose = require('mongoose');

// URI de conexión — equivalente al DATABASE_URL de PostgreSQL
const MONGO_URI = process.env.MONGO_URI ||
  'mongodb+srv://admin:mipass123@cluster0.sf3nhqw.mongodb.net/spotifyRAG?retryWrites=true&w=majority';

// Nombre de la base de datos — equivalente al schema en PostgreSQL
const DB_NAME = process.env.DB_NAME || 'spotifyRAG';

// Opciones de conexión
const mongoOptions = {
  dbName: DB_NAME,

  // Tamaño del pool de conexiones
  // En SQL era pool.max = 10, aquí se mantiene el mismo valor
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeout de conexión (ms)
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000
};

// --- Función principal de conexión ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, mongoOptions);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📦 Base de datos: ${conn.connection.name}`);
    console.log(`🔗 Colecciones disponibles: canciones, chunks`);

    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// --- Eventos de conexión (equivalente a listeners del pool en pg) ---

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose conectado a MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Error en la conexión de Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 Mongoose desconectado de MongoDB');
});

// Cierre limpio al terminar el proceso (equivalente a pool.end() en pg)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexión a MongoDB cerrada correctamente (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexión a MongoDB cerrada correctamente (SIGTERM)');
  process.exit(0);
});

module.exports = connectDB;