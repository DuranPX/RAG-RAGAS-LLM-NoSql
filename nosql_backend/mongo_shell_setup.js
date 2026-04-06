
use("spotifyRAG");

// 1. usuarios
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "correo", "plan_suscripcion"],
      properties: {
        nombre: { bsonType: "string" },
        correo: { bsonType: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        plan_suscripcion: { bsonType: "string", enum: ["free", "premium", "family"] },
        tiempo_escucha: { bsonType: ["double", "int", "null"], minimum: 0 },
        portada: {
          bsonType: ["object", "null"],
          properties: {
            url: { bsonType: "string" },
            descripcion: { bsonType: "string" }
          }
        },
        historial_reciente: { bsonType: "array" },
        fecha_registro: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.usuarios.createIndex({ correo: 1 }, { unique: true, name: "idx_correo_unico" });
db.usuarios.createIndex({ plan_suscripcion: 1 }, { name: "idx_plan" });
db.usuarios.createIndex({ fecha_registro: -1 }, { name: "idx_fecha_registro" });

// 2. artistas
db.createCollection("artistas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre"],
      properties: {
        nombre: { bsonType: "string" },
        pais: { bsonType: ["string", "null"] },
        descripcion: { bsonType: ["string", "null"] },
        generos: { bsonType: "array", items: { bsonType: "string" } },
        emb_descripcion: { bsonType: ["array", "null"] },
        fecha_formacion: { bsonType: ["date", "null"] }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.artistas.createIndex({ nombre: 1 }, { name: "idx_artista_nombre" });
db.artistas.createIndex({ generos: 1 }, { name: "idx_artista_generos" });
db.artistas.createIndex({ pais: 1 }, { name: "idx_artista_pais" });

// 3. albums
db.createCollection("albums", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo", "id_artista"],
      properties: {
        titulo: { bsonType: "string" },
        id_artista: { bsonType: "objectId" },
        anio_lanzamiento: { bsonType: ["int", "null"] },
        tipo: { bsonType: ["string", "null"] },
        portada: {
          bsonType: ["object", "null"],
          properties: {
            url: { bsonType: "string" },
            descripcion: { bsonType: ["string", "null"] },
            emb_imagen: { bsonType: ["array", "null"] }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.albums.createIndex({ id_artista: 1 }, { name: "idx_album_artista" });
db.albums.createIndex({ anio_lanzamiento: -1 }, { name: "idx_album_anio" });
db.albums.createIndex({ titulo: "text" }, { name: "idx_album_texto" });

// 4. generos
db.createCollection("generos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre"],
      properties: {
        nombre: { bsonType: "string" },
        descripcion: { bsonType: ["string", "null"] }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.generos.createIndex({ nombre: 1 }, { unique: true, name: "idx_genero_nombre_unico" });

// 5. canciones
db.createCollection("canciones", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo", "letra", "emb_letra", "duracion", "genero", "artista", "album"],
      properties: {
        titulo: { bsonType: "string", maxLength: 150 },
        letra: { bsonType: "string" },
        emb_letra: {
          bsonType: "array",
          minItems: 384, maxItems: 384,
          items: { bsonType: "double" }
        },
        duracion: { bsonType: "number", minimum: 1 },
        genero: { bsonType: "string" },
        id_genero: { bsonType: ["objectId", "null"] },
        idioma: { bsonType: ["string", "null"] },
        emociones: { bsonType: "array", items: { bsonType: "string" } },
        artista: {
          bsonType: "object",
          required: ["_id", "nombre", "pais"],
          properties: {
            _id: { bsonType: "objectId" },
            nombre: { bsonType: "string" },
            pais: { bsonType: "string" }
          }
        },
        id_artista: { bsonType: "objectId" },
        album: {
          bsonType: "object",
          required: ["_id", "titulo", "anio"],
          properties: {
            _id: { bsonType: "objectId" },
            titulo: { bsonType: "string" },
            anio: { bsonType: "int", minimum: 1900 }
          }
        },
        id_album: { bsonType: "objectId" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.canciones.createIndex({ genero: 1 }, { name: "idx_cancion_genero" });
db.canciones.createIndex({ id_artista: 1 }, { name: "idx_cancion_artista" });
db.canciones.createIndex({ id_album: 1 }, { name: "idx_cancion_album" });
db.canciones.createIndex({ titulo: "text", letra: "text" }, { name: "idx_cancion_texto" });
db.canciones.createIndex({ "artista.nombre": 1 }, { name: "idx_cancion_nombre_artista" });

// 6. playlists
db.createCollection("playlists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo", "id_usuario"],
      properties: {
        titulo: { bsonType: "string" },
        descripcion: { bsonType: ["string", "null"] },
        id_usuario: { bsonType: "objectId" },
        visibilidad: { bsonType: ["string", "null"], enum: ["public", "private", null] },
        portada: {
          bsonType: ["object", "null"],
          properties: {
            url: { bsonType: "string" },
            descripcion: { bsonType: "string" }
          }
        },
        canciones: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["id_cancion", "titulo", "nombre_artista"],
            properties: {
              id_cancion: { bsonType: "objectId" },
              titulo: { bsonType: "string" },
              nombre_artista: { bsonType: "string" },
              duracion: { bsonType: ["double", "int", "null"] },
              portada_url: { bsonType: ["string", "null"] }
            }
          }
        },
        fecha_creacion: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.playlists.createIndex({ id_usuario: 1 }, { name: "idx_playlist_usuario" });
db.playlists.createIndex({ id_usuario: 1, fecha_creacion: -1 }, { name: "idx_playlist_usuario_fecha" });
db.playlists.createIndex({ titulo: "text" }, { name: "idx_playlist_texto" });

// 7. eventos
db.createCollection("eventos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_usuario", "cancion_snapshot", "emocion", "tipo_relacion"],
      properties: {
        id_usuario: { bsonType: "objectId" },
        cancion_snapshot: {
          bsonType: "object",
          required: ["id_cancion", "titulo", "nombre_artista"],
          properties: {
            id_cancion: { bsonType: "objectId" },
            titulo: { bsonType: "string" },
            nombre_artista: { bsonType: "string" },
            nombre_genero: { bsonType: ["string", "null"] },
            duracion: { bsonType: ["double", "int", "null"] }
          }
        },
        emocion: {
          bsonType: "object",
          required: ["nombre"],
          properties: {
            nombre: { bsonType: "string" },
            descripcion: { bsonType: ["string", "null"] }
          }
        },
        tipo_relacion: { bsonType: "string", enum: ["favorita", "reproducida", "buscada"] },
        fecha_evento: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.eventos.createIndex({ id_usuario: 1, fecha_evento: -1 }, { name: "idx_evento_usuario_fecha" });
db.eventos.createIndex({ "cancion_snapshot.id_cancion": 1 }, { name: "idx_evento_cancion" });
db.eventos.createIndex({ "emocion.nombre": 1 }, { name: "idx_evento_emocion" });
db.eventos.createIndex({ id_usuario: 1, "cancion_snapshot.nombre_artista": 1 }, { name: "idx_evento_usuario_artista" });
db.eventos.createIndex({ fecha_evento: 1, tipo_relacion: 1 }, { name: "idx_evento_fecha_tipo" });

// 8. consultas
db.createCollection("consultas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_usuario", "texto_pregunta", "fecha"],
      properties: {
        id_usuario: { bsonType: ["objectId", "null"] },
        texto_pregunta: { bsonType: "string" },
        fecha: { bsonType: "date" },
        tipo_consulta: { bsonType: ["string", "null"], enum: ["texto-texto", "imagen-texto", "hibrido", null] },
        tiene_imagen: { bsonType: ["bool", "null"] },
        vector_embedding: { bsonType: ["array", "null"] },
        modelo_embedding: { bsonType: ["string", "null"] },
        resultados: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              id_cancion: { bsonType: ["objectId", "null"] },
              id_artista: { bsonType: ["objectId", "null"] },
              id_album: { bsonType: ["objectId", "null"] },
              titulo: { bsonType: ["string", "null"] },
              nombre_artista: { bsonType: ["string", "null"] },
              tipo_fuente: { bsonType: ["string", "null"] },
              score_similitud: { bsonType: ["double", "null"] }
            }
          }
        },
        respuesta_llm: {
          bsonType: ["object", "null"],
          properties: {
            texto: { bsonType: "string" },
            modelo_usado: { bsonType: "string" },
            fecha_generacion: { bsonType: "date" },
            chunks_usados: { bsonType: "array", items: { bsonType: "objectId" } }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.consultas.createIndex({ id_usuario: 1, fecha: -1 }, { name: "idx_consulta_usuario_fecha" });
db.consultas.createIndex({ fecha: -1 }, { name: "idx_consulta_fecha" });
db.consultas.createIndex({ texto_pregunta: "text" }, { name: "idx_consulta_texto" });

// 9. resenas (polimorfica)
db.createCollection("resenas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_usuario", "tipo_objeto", "id_objeto", "calificacion"],
      properties: {
        id_usuario: { bsonType: "objectId" },
        tipo_objeto: { bsonType: "string", enum: ["cancion", "album", "playlist"] },
        id_objeto: { bsonType: "objectId" },
        calificacion: { bsonType: "int", minimum: 1, maximum: 5 },
        comentario: { bsonType: ["string", "null"] },
        emb_comentario: { bsonType: ["array", "null"] },
        fecha: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.resenas.createIndex({ id_usuario: 1 }, { name: "idx_resena_usuario" });
db.resenas.createIndex({ tipo_objeto: 1, id_objeto: 1 }, { name: "idx_resena_objeto" });
db.resenas.createIndex({ calificacion: -1 }, { name: "idx_resena_calificacion" });
db.resenas.createIndex({ fecha: -1 }, { name: "idx_resena_fecha" });

// 10. chunks
db.createCollection("chunks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["doc_id", "tipo_fuente", "chunk_index", "estrategia_chunking", "chunk_texto", "embedding", "modelo"],
      properties: {
        doc_id: { bsonType: "objectId" },
        tipo_fuente: { bsonType: "string", enum: ["cancion", "artista", "album"] },
        chunk_index: { bsonType: "int", minimum: 0 },
        estrategia_chunking: { bsonType: "string", enum: ["fixed-size", "sentence-aware", "semantic"] },
        chunk_texto: { bsonType: "string" },
        embedding: {
          bsonType: "array",
          minItems: 384, maxItems: 384,
          items: { bsonType: "double" }
        },
        modelo: { bsonType: "string" },
        fecha_ingesta: { bsonType: "date" },
        metadata: { bsonType: ["object", "null"] }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.chunks.createIndex({ doc_id: 1, chunk_index: 1 }, { name: "idx_chunk_doc_index" });
db.chunks.createIndex({ tipo_fuente: 1 }, { name: "idx_chunk_tipo_fuente" });
db.chunks.createIndex({ estrategia_chunking: 1 }, { name: "idx_chunk_estrategia" });
db.chunks.createIndex({ doc_id: 1, estrategia_chunking: 1 }, { name: "idx_chunk_doc_estrategia" });

// 11. evaluaciones (RAGAS)
db.createCollection("evaluaciones", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_consulta", "metricas"],
      properties: {
        id_consulta: { bsonType: "objectId" },
        metricas: {
          bsonType: "object",
          properties: {
            faithfulness: { bsonType: ["double", "null"] },
            answer_relevancy: { bsonType: ["double", "null"] },
            context_precision: { bsonType: ["double", "null"] },
            context_recall: { bsonType: ["double", "null"] }
          }
        },
        modelo_evaluado: { bsonType: ["string", "null"] },
        fecha_evaluacion: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

db.evaluaciones.createIndex({ id_consulta: 1 }, { name: "idx_evaluacion_consulta" });
db.evaluaciones.createIndex({ fecha_evaluacion: -1 }, { name: "idx_evaluacion_fecha" });

// ====== Índices Vectoriales (Atlas Search) ======
print("\n--- Solicitando creación de Índices de Vector Search en Atlas ---");
try {
  db.runCommand({
    createSearchIndexes: "canciones",
    indexes: [
      {
        name: "vector_idx_emb_letra",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "emb_letra",
              numDimensions: 384,
              similarity: "cosine"
            }
          ]
        }
      }
    ]
  });
  print("✓ Solicitado vector_idx_emb_letra (canciones)");
} catch(e) {
  print("X Error vector_idx_emb_letra:", e.message);
}

try {
  db.runCommand({
    createSearchIndexes: "chunks",
    indexes: [
      {
        name: "vector_idx_embedding_chunks",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: 384,
              similarity: "cosine"
            }
          ]
        }
      }
    ]
  });
  print("✓ Solicitado vector_idx_embedding_chunks (chunks)");
} catch(e) {
  print("X Error vector_idx_embedding_chunks:", e.message);
}

try {
  db.runCommand({
    createSearchIndexes: "albums",
    indexes: [
      {
        name: "vector_idx_portada_imagen",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "portada.emb_imagen",
              numDimensions: 512,
              similarity: "cosine"
            }
          ]
        }
      }
    ]
  });
  print("✓ Solicitado vector_idx_portada_imagen (albums)");
} catch(e) {
  print("X Error vector_idx_portada_imagen:", e.message);
}

// Aggregations de referencia
const historialConsultasUsuario = (id_usuario_str) => [
  { $match: { id_usuario: ObjectId(id_usuario_str) } },
  { $sort: { fecha: -1 } },
  { $limit: 50 },
  {
    $project: {
      texto_pregunta: 1,
      fecha: 1,
      "respuesta_llm.texto": 1,
      n_resultados: { $size: { $ifNull: ["$resultados", []] } }
    }
  }
];

const emocionDominanteUsuario = (id_usuario_str, dias = 365) => [
  {
    $match: {
      id_usuario: ObjectId(id_usuario_str),
      fecha_evento: {
        $gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
      }
    }
  },
  { $group: { _id: "$emocion.nombre", veces: { $sum: 1 } } },
  { $sort: { veces: -1 } },
  { $project: { _id: 0, nombre_emocion: "$_id", veces: 1 } }
];

const playlistsConMasCanciones = (id_usuario_str, limit = 10) => [
  { $match: { id_usuario: ObjectId(id_usuario_str) } },
  {
    $project: {
      titulo: 1,
      descripcion: 1,
      "portada.url": 1,
      n_canciones: { $size: { $ifNull: ["$canciones", []] } },
      fecha_creacion: 1
    }
  },
  { $sort: { n_canciones: -1 } },
  { $limit: limit }
];

const chunksPorEstrategia = () => [
  { $group: { _id: "$estrategia_chunking", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { _id: 0, estrategia: "$_id", total: 1 } }
];

const resenasPorTipo = () => [
  {
    $group: {
      _id: "$tipo_objeto",
      total: { $sum: 1 },
      promedio_calificacion: { $avg: "$calificacion" }
    }
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      tipo_objeto: "$_id",
      total: 1,
      promedio_calificacion: { $round: ["$promedio_calificacion", 2] }
    }
  }
];

print("\nColecciones en spotifyRAG:");
db.getCollectionNames().forEach(c => print(" -", c));
print("\nSetup completo");