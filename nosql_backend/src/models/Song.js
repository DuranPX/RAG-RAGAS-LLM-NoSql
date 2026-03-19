

// Cambios:
//   - id_cancion → _id (MongoDB genera ObjectId automáticamente)
//   - artista y album pasan a ser subdocumentos embebidos (resumen)
//     además de la referencia, para evitar JOINs en lecturas frecuentes
//   - emociones: deja de ser tabla separada (cancion_emocion)
//     y se convierte en array de strings embebido
//   - emb_letra: en SQL era vector(384), aquí es Array de 384 números


const mongoose = require('mongoose');

// --- Subdocumento: resumen de artista embebido ---
const artistaResumenSchema = new mongoose.Schema({
  // id_artista conservado del SQL
  id_artista: { type: mongoose.Schema.Types.ObjectId, ref: 'Artista', required: true },
  nombre:     { type: String, required: true },
  pais:       { type: String }
}, { _id: false });

// --- Subdocumento: resumen de album embebido ---
const albumResumenSchema = new mongoose.Schema({
  // id_album conservado del SQL
  id_album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  titulo:   { type: String, required: true },
  // anio conservado del SQL (check anio >= 1900)
  anio:     { type: Number, min: 1900 }
}, { _id: false });

// --- Schema principal de cancion ---
const songSchema = new mongoose.Schema(
  {
    // titulo conservado del SQL (varchar 150 not null)
    titulo: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true,
      maxlength: 150
    },

    // letra conservada del SQL (text)
    letra: {
      type: String,
      required: [true, 'La letra es obligatoria']
    },

    // emb_letra conservado del SQL (vector 384)
    // En MongoDB: array de 384 números Float
    emb_letra: {
      type: [Number],
      required: [true, 'El embedding de letra es obligatorio'],
      validate: {
        validator: v => v.length === 384,
        message: 'emb_letra debe tener exactamente 384 dimensiones'
      }
    },

    // duracion conservado del SQL (numeric check duracion > 0)
    duracion: {
      type: Number,
      required: [true, 'La duracion es obligatoria'],
      min: [1, 'La duracion debe ser mayor a 0']
    },

    // genero: en SQL era FK id_genero → tabla genero
    // En NoSQL se desnormaliza el nombre directamente (documento dice)
    genero: {
      type: String,
      required: [true, 'El genero es obligatorio']
    },

    // id_genero conservado del SQL como referencia opcional
    id_genero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero'
    },

    // artista: en SQL era id_artista FK + JOINs
    // En NoSQL: referencia + resumen embebido para lecturas rápidas
    artista: {
      type: artistaResumenSchema,
      required: [true, 'El artista es obligatorio']
    },

    // id_artista conservado del SQL como referencia directa
    id_artista: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artista',
      required: [true, 'id_artista es obligatorio']
    },

    // album: en SQL era id_album FK nullable
    album: {
      type: albumResumenSchema
    },

    // id_album conservado del SQL como referencia
    id_album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    },

    // emociones: en SQL era tabla separada cancion_emocion (eliminada)
    // En NoSQL: array de strings embebido en el documento
    emociones: {
      type: [String],
      default: []
    }
  },
  {
    // Nombre de colección en MongoDB: "canciones"
    collection: 'canciones',
    timestamps: true
  }
);

// --- Índices ---
// Índice de texto para búsquedas por título y letra
songSchema.index({ titulo: 'text', letra: 'text' });

// Índice para filtrar por género (consultas frecuentes)
songSchema.index({ genero: 1 });

// Índice por artista (para top artistas por usuario)
songSchema.index({ 'artista.id_artista': 1 });

// Nota: el índice vectorial sobre emb_letra se crea en MongoDB Atlas UI
// Nombre: vector_idx_emb_letra | path: emb_letra | dims: 384 | cosine

module.exports = mongoose.model('Song', songSchema);