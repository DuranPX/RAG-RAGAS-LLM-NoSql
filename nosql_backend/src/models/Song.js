const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const songSchema = {
  bsonType: 'object',
  required: ['titulo', 'letra', 'emb_letra', 'duracion', 'genero', 'artista', 'album'],
  properties: {
    titulo: {
      bsonType: 'string',
      maxLength: 150
    },
    letra: {
      bsonType: 'string'
    },
    emb_letra: {
      bsonType: 'array',
      minItems: 384,
      maxItems: 384,
      items: { bsonType: 'double' }
    },
    duracion: {
      bsonType: 'number',
      minimum: 1
    },
    genero: {
      bsonType: 'string'
    },
    id_genero: {
      bsonType: 'objectId'
    },
    artista: {
      bsonType: 'object',
      required: ['id_artista', 'nombre'],
      properties: {
        id_artista: { bsonType: 'objectId' },
        nombre:     { bsonType: 'string' },
        pais:       { bsonType: 'string' }
      }
    },
    id_artista: {
      bsonType: 'objectId'
    },
    album: {
      bsonType: 'object',
      required: ['id_album', 'titulo'],
      properties: {
        id_album: { bsonType: 'objectId' },
        titulo:   { bsonType: 'string' },
        anio:     { bsonType: 'int', minimum: 1900 }
      }
    },
    id_album: {
      bsonType: 'objectId'
    },
    emociones: {
      bsonType: 'array',
      items: { bsonType: 'string' }
    }
  }
};

const getCollection = () => getCollections().canciones;

const SongModel = {
  insertOne: async (doc) => {
    const col = getCollection();
    return col.insertOne({ ...doc, createdAt: new Date(), updatedAt: new Date() });
  },

  insertMany: async (docs) => {
    const col = getCollection();
    const now = new Date();
    return col.insertMany(docs.map(d => ({ ...d, createdAt: now, updatedAt: now })));
  },

  findById: async (id) => {
    const col = getCollection();
    return col.findOne({ _id: new ObjectId(id) });
  },

  find: async (filter = {}, options = {}) => {
    const col = getCollection();
    return col.find(filter, options).toArray();
  },

  updateById: async (id, update) => {
    const col = getCollection();
    return col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } }
    );
  },

  deleteById: async (id) => {
    const col = getCollection();
    return col.deleteOne({ _id: new ObjectId(id) });
  },

  vectorSearch: async (queryVector, limit = 5) => {
    const col = getCollection();
    return col.aggregate([
      {
        $vectorSearch: {
          index: 'vector_idx_emb_letra',
          path: 'emb_letra',
          queryVector,
          numCandidates: limit * 10,
          limit
        }
      },
      {
        $project: {
          titulo: 1,
          genero: 1,
          artista: 1,
          album: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();
  }
};

module.exports = { SongModel, songSchema };