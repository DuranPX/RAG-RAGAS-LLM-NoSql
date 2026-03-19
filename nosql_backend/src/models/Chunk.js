
// Es la pieza central del pipeline RAG.


const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    // doc_id: referencia al documento padre (cancion, artista o album)
    // Equivalente a id_cancion / id_artista / id_album del SQL
    doc_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'doc_id es obligatorio']
    },

    // tipo_fuente: indica de qué colección viene doc_id
    tipo_fuente: {
      type: String,
      required: [true, 'tipo_fuente es obligatorio'],
      enum: {
        values: ['cancion', 'artista', 'album'],
        message: 'tipo_fuente debe ser cancion, artista o album'
      }
    },

    // chunk_index: posición del fragmento dentro del documento padre
    chunk_index: {
      type: Number,
      required: [true, 'chunk_index es obligatorio'],
      min: 0
    },

    // estrategia_chunking: campo obligatorio del proyecto
    // Indica cómo se fragmentó el texto
    estrategia_chunking: {
      type: String,
      required: [true, 'estrategia_chunking es obligatorio'],
      enum: {
        values: ['fixed-size', 'sentence-aware'],
        message: 'estrategia_chunking debe ser fixed-size o sentence-aware'
      }
    },

    // chunk_texto: el fragmento de texto
    // Equivalente a letra (text) del SQL pero parcial
    chunk_texto: {
      type: String,
      required: [true, 'chunk_texto es obligatorio']
    },

    // embedding: vector del fragmento (384 dims, mismo modelo que emb_letra)
    // Equivalente a emb_letra vector(384) del SQL pero a nivel de chunk
    embedding: {
      type: [Number],
      required: [true, 'embedding es obligatorio'],
      validate: {
        validator: v => v.length === 384,
        message: 'embedding debe tener exactamente 384 dimensiones'
      }
    },

    // modelo: nombre del modelo que generó el embedding
    // Valor esperado: "all-MiniLM-L6-v2"
    modelo: {
      type: String,
      required: [true, 'modelo es obligatorio'],
      trim: true
    },

    // fecha_ingesta: cuándo se procesó este chunk
    // Equivalente a fecha timestamp del SQL
    fecha_ingesta: {
      type: Date,
      default: Date.now
    },

    // metadata adicional opcional (para variaciones entre estrategias)
    // fixed-size puede guardar: { tokens: 128 }
    // sentence-aware puede guardar: { n_oraciones: 3 }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    collection: 'chunks',
    timestamps: true
  }
);

// --- Índices ---

// Índice compuesto: todos los chunks de un documento en orden
chunkSchema.index({ doc_id: 1, chunk_index: 1 });

// Índice por estrategia para el experimento comparativo
chunkSchema.index({ estrategia_chunking: 1 });

// Índice por tipo de fuente
chunkSchema.index({ tipo_fuente: 1 });

// Nota: el índice vectorial sobre "embedding" se crea en MongoDB Atlas UI
// Nombre: vector_idx_embedding_chunks | path: embedding | dims: 384 | cosine

module.exports = mongoose.model('Chunk', chunkSchema);