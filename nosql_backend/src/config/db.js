require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME   = process.env.DB_NAME || 'spotifyRAG';

if (!MONGO_URI) {
  throw new Error('MONGO_URI no definida en .env');
}

const client = new MongoClient(MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
});

let db = null;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ MongoDB conectado');
    console.log('📦 Base de datos: ' + DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Base de datos no inicializada. Llama connectDB() primero.');
  return db;
};

process.on('SIGINT', async () => {
  await client.close();
  console.log('🔌 MongoDB cerrado');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.close();
  console.log('🔌 MongoDB cerrado');
  process.exit(0);
});

module.exports = { connectDB, getDB };