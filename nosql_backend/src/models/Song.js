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
      required: ['_id', 'nombre', 'pais'],
      properties: {
        _id: { bsonType: 'objectId' },
        nombre: { bsonType: 'string' },
        pais: { bsonType: 'string' }
      }
    },
    id_artista: {
      bsonType: 'objectId'
    },
    album: {
      bsonType: 'object',
      required: ['_id', 'titulo', 'anio'],
      properties: {
        _id: { bsonType: 'objectId' },
        titulo: { bsonType: 'string' },
        anio: { bsonType: 'int', minimum: 1900 }
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

  findExactTitle: async (title) => {
    if (!title || typeof title !== 'string') return null;
    const col = getCollection();
    const textRegex = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    return col.findOne({
      titulo: textRegex
    });
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
  },

  searchByMetadata: async (query, limit = 5) => {
    const col = getCollection();

    try {
      return col.aggregate([
        {
          $search: {
            compound: {
              should: [
                {
                  phrase: {
                    query,
                    path: 'titulo',
                    score: { boost: { value: 6 } }
                  }
                },
                {
                  text: {
                    query,
                    path: 'titulo',
                    score: { boost: { value: 3 } }
                  }
                },
                {
                  text: {
                    query,
                    path: 'artista.nombre',
                    score: { boost: { value: 3 } }
                  }
                },
                {
                  text: {
                    query,
                    path: 'album.titulo',
                    score: { boost: { value: 3 } }
                  }
                },
                {
                  text: {
                    query,
                    path: 'genero',
                    score: { boost: { value: 1 } }
                  }
                }
              ],
              minimumShouldMatch: 1
            }
          }
        },
        {
          $addFields: {
            score: { $meta: 'searchScore' }
          }
        },
        {
          $sort: { score: -1 }
        },
        {
          $project: {
            _id: 1,
            titulo: 1,
            genero: 1,
            artista: 1,
            album: 1,
            score: 1
          }
        },
        {
          $limit: limit
        }
      ]).toArray();
    } catch (error) {
      const textRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return col.find({
        $or: [
          { titulo: textRegex },
          { 'artista.nombre': textRegex },
          { 'album.titulo': textRegex },
          { genero: textRegex }
        ]
      }).project({ _id: 1, titulo: 1, genero: 1, artista: 1, album: 1 }).limit(limit).toArray();
    }
  },
  async searchByEmotion(emocion, limit = 5) {
    const col = getCollection();

    return await col
      .find({
        emociones: {
          $elemMatch: {
            $regex: new RegExp(emocion, 'i')
          }
        }
      })
      .limit(limit)
      .toArray();
  }
};


module.exports = { SongModel, songSchema };