const { MongoClient } = require("mongodb");

const URI = process.env.MONGODB_URI;
const DB_NAME = "spotifyRAG";

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  db = client.db(DB_NAME);
  console.log(`MongoDB conectado a (debe coincidir, debug) ${DB_NAME}`);
  return db;
}

function getDB() {
  if (!db) throw new Error("DB no inicializada");
  return db;
}

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
  };
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log("MongoDB desconectado");
  }
}

module.exports = { connectDB, getDB, getCollections, closeDB };