const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const chunkSchema = {
  bsonType: 'object',
  required: ['doc_id', 'tipo_fuente', 'chunk_index', 'estrategia_chunking', 'chunk_texto', 'embedding', 'modelo'],
  properties: {
    doc_id: {
      bsonType: 'objectId'
    },
    tipo_fuente: {
      bsonType: 'string',
      enum: ['cancion', 'artista', 'album']
    },
    chunk_index: {
      bsonType: 'int',
      minimum: 0
    },
    estrategia_chunking: {
      bsonType: 'string',
      enum: ['fixed-size', 'sentence-aware']
    },
    chunk_texto: {
      bsonType: 'string'
    },
    embedding: {
      bsonType: 'array',
      minItems: 384,
      maxItems: 384,
      items: { bsonType: 'double' }
    },
    modelo: {
      bsonType: 'string'
    },
    fecha_ingesta: {
      bsonType: 'date'
    },
    metadata: {
      bsonType: 'object'
    }
  }
};

const getCollection = () => getDB().collection('chunks');

const ChunkModel = {
  insertOne: async (doc) => {
    const col = getCollection();
    return col.insertOne({
      ...doc,
      fecha_ingesta: doc.fecha_ingesta || new Date(),
      createdAt: new Date()
    });
  },

  insertMany: async (docs) => {
    const col = getCollection();
    const now = new Date();
    return col.insertMany(docs.map(d => ({
      ...d,
      fecha_ingesta: d.fecha_ingesta || now,
      createdAt: now
    })));
  },

  findByDocId: async (docId) => {
    const col = getCollection();
    return col.find({ doc_id: new ObjectId(docId) })
      .sort({ chunk_index: 1 })
      .toArray();
  },

  findByEstrategia: async (estrategia) => {
    const col = getCollection();
    return col.find({ estrategia_chunking: estrategia }).toArray();
  },

  vectorSearch: async (queryVector, limit = 5) => {
    const col = getCollection();
    return col.aggregate([
      {
        $vectorSearch: {
          index: 'vector_idx_embedding_chunks',
          path: 'embedding',
          queryVector,
          numCandidates: limit * 10,
          limit
        }
      },
      {
        $project: {
          chunk_texto: 1,
          estrategia_chunking: 1,
          tipo_fuente: 1,
          doc_id: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();
  }
};

module.exports = { ChunkModel, chunkSchema };