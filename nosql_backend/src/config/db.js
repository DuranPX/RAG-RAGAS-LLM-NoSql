require('dotenv').config();
const { MongoClient } = require('mongodb');

let db = null;
const MONGO_URI = (process.env.MONGODB_URI || '').trim();
const DB_NAME   = process.env.DB_NAME || 'spotifyRAG';

if (!MONGO_URI) {
  throw new Error('MONGODB_URI no definida en .env');
}

const client = new MongoClient(MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
});

function getCollections() {
  const database = getDB();
  return {
    usuarios:  database.collection("usuarios"),
    playlists: database.collection("playlists"),
    events:    database.collection("events"),
    queries:   database.collection("queries"),
    canciones: database.collection("canciones"),
    artists:   database.collection("artists"),
    albums:    database.collection("albums"),
    chunks:    database.collection("chunks"),
  };
}

const connectDB = async () => {
  try {
    if (db) return db;
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDB conectado');
    console.log('Base de datos: ' + DB_NAME);
    return db;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Base de datos no inicializada.');
  return db;
};

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB cerrado');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.close();
  console.log('MongoDB cerrado');
  process.exit(0);
});

module.exports = { connectDB, getDB, getCollections };