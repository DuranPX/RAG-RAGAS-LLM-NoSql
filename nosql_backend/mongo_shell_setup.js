
use("spotifyRAG");

// 1. COLECCIÓN: usuarios
// Portada embebida (URL iTunes), plan y tiempo_escucha
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "correo", "plan_suscripcion"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre del usuario — requerido"
        },
        correo: {
          bsonType: "string",
          pattern: "^[^@]+@[^@]+\\.[^@]+$", // aqui aplicamos regex de una vez
          description: "Correo válido — requerido y único"
        },
        plan_suscripcion: {
          bsonType: "string",
          enum: ["free", "premium", "family"], //mantenemos el valor agregado del semestre pasado
          description: "Plan de suscripción"
        },
        tiempo_escucha: {
          bsonType: ["double", "int", "null"],
          minimum: 0,
          description: "Minutos totales escuchados"
        },
        portada: {
          bsonType: ["object", "null"],
          properties: {
            url: { bsonType: "string" },        // URL de iTunes API, igual que el semestre pasado, solo que ahora lo metemos en la coleccion de usuarios y aun toca mira
            descripcion: { bsonType: "string" }
          }
        },
        fecha_registro: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Índices para usuarios
db.usuarios.createIndex({ correo: 1 }, { unique: true, name: "idx_correo_unico" });
db.usuarios.createIndex({ plan_suscripcion: 1 }, { name: "idx_plan" });
db.usuarios.createIndex({ fecha_registro: -1 }, { name: "idx_fecha_registro" });

print("Colección 'usuarios' creada con índices");

// 2. COLECCIÓN: playlists
// Canciones: híbrido — ObjectId + campos clave desnormalizados y sobre la portada, 
// esta embebida con URL iTunes, pero toco hacer un fix y agregarle el embedding despues de crearlo con el micro de python
db.createCollection("playlists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo", "id_usuario"],
      properties: {
        titulo: {
          bsonType: "string",
          description: "Título de la playlist — requerido"
        },
        descripcion: {
          bsonType: ["string", "null"]
        },
        id_usuario: {
          bsonType: "objectId",
          description: "Referencia al usuario dueño"
        },
        portada: {
          bsonType: ["object", "null"],
          properties: {
            url: { bsonType: "string" },
            descripcion: { bsonType: "string" }
          }
        },
        canciones: {
          // Array híbrido: ObjectId + campos clave desnormalizados
          // No embebí letra ni embedding, solo lo que muestra la UI
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
        fecha_creacion: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Índices para playlists
db.playlists.createIndex({ id_usuario: 1 }, { name: "idx_playlist_usuario" });
db.playlists.createIndex({ id_usuario: 1, fecha_creacion: -1 }, { name: "idx_playlist_usuario_fecha" });
db.playlists.createIndex({ titulo: "text" }, { name: "idx_playlist_texto" });

print("✓ Colección 'playlists' creada con índices");

// 3. COLECCIÓN: events
// Un documento = un evento de escucha con emoción
// Todo embebido: cancion_snapshot + emocion. cancion_snapshot: desnormalización parcial (sin letra ni embedding)
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_usuario", "cancion_snapshot", "emocion", "tipo_relacion"],
      properties: {
        id_usuario: {
          bsonType: "objectId",
          description: "Referencia al usuario"
        },
        cancion_snapshot: {
          // Desnormalización parcial — campos para analítica y RAG
          // La letra y emb_letra viven en colección 'canciones'
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
          // Totalmente embebida — sin lookup en consultas
          bsonType: "object",
          required: ["nombre"],
          properties: {
            nombre: { bsonType: "string" },
            descripcion: { bsonType: ["string", "null"] }
          }
        },
        tipo_relacion: {
          bsonType: "string",
          enum: ["favorita", "reproducida", "buscada"]
        },
        fecha_evento: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Índices para events
db.events.createIndex({ id_usuario: 1, fecha_evento: -1 }, { name: "idx_evento_usuario_fecha" });
db.events.createIndex({ "cancion_snapshot.id_cancion": 1 }, { name: "idx_evento_cancion" });
db.events.createIndex({ "emocion.nombre": 1 }, { name: "idx_evento_emocion" });
db.events.createIndex(
  { id_usuario: 1, "cancion_snapshot.nombre_artista": 1 },
  { name: "idx_evento_usuario_artista" }
);
// Índice compuesto fecha + tipo para análisis temporal
db.events.createIndex(
  { fecha_evento: 1, tipo_relacion: 1 },
  { name: "idx_evento_fecha_tipo" }
);

print("✓ Colección 'events' creada con índices");

// ===========================================================
// 4. COLECCIÓN: queries
// Colapsa consulta + query_embedding + resultados en un doc
// respuesta_llm embebida como caché semántico
// ===========================================================
db.createCollection("queries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_usuario", "texto_pregunta", "fecha"],
      properties: {
        id_usuario: {
          bsonType: "objectId"
        },
        texto_pregunta: {
          bsonType: "string",
          description: "Texto de la consulta — requerido"
        },
        fecha: {
          bsonType: "date"
        },
        // El vector de la consulta — generado por el microservicio Python
        vector_embedding: {
          bsonType: ["array", "null"],
          description: "Vector float[384] generado por all-MiniLM-L6-v2"
        },
        modelo_embedding: {
          bsonType: ["string", "null"]
          // Ejemplo: "all-MiniLM-L6-v2"
        },
        // Resultados embebidos — score de similitud incluido
        resultados: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              id_cancion: { bsonType: ["objectId", "null"] },
              id_artista: { bsonType: ["objectId", "null"] },
              titulo: { bsonType: ["string", "null"] },
              nombre_artista: { bsonType: ["string", "null"] },
              score_similitud: { bsonType: ["double", "null"] }
            }
          }
        },
        // Respuesta del LLM — caché semántico + contexto para RAGAS
        respuesta_llm: {
          bsonType: ["object", "null"],
          properties: {
            texto: { bsonType: "string" },
            modelo_usado: { bsonType: "string" },  // "llama-3.1", "mixtral", etc.
            fecha_generacion: { bsonType: "date" },
            chunks_usados: {
              // Referencias a los chunks de 'canciones' que usó el LLM
              bsonType: "array",
              items: { bsonType: "objectId" }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Índices para queries
db.queries.createIndex({ id_usuario: 1, fecha: -1 }, { name: "idx_query_usuario_fecha" });
db.queries.createIndex({ fecha: -1 }, { name: "idx_query_fecha" });
// Índice de texto para búsqueda sobre preguntas previas
db.queries.createIndex({ texto_pregunta: "text" }, { name: "idx_query_texto" });

print("✓ Colección 'queries' creada con índices");

// ===========================================================
// NOTA ATLAS VECTOR SEARCH
// Los índices vectoriales NO se crean desde mongosh.
// Debes crearlos desde Atlas UI o Atlas CLI:
//
// Atlas UI → Search → Create Index → JSON Editor:
//
// Índice para canciones (emb_letra):
// {
//   "fields": [{
//     "type": "vector",
//     "path": "emb_letra",
//     "numDimensions": 384,
//     "similarity": "cosine"
//   }]
// }
// Nombre sugerido: vector_idx_emb_letra
//
// Índice para portadas (emb_imagen) en colección canciones/portadas:
// {
//   "fields": [{
//     "type": "vector",
//     "path": "emb_imagen",
//     "numDimensions": 512,
//     "similarity": "cosine"
//   }]
// }
// Nombre sugerido: idx_vector_imagen
// ===========================================================

print("⚠ Recuerda crear los índices vectoriales desde Atlas UI");

// ===========================================================
// AGGREGATIONS — Las 3 del día
// ===========================================================

// ----------------------------------------------------------
// AGG 1: Historial de consultas por usuario
// Colección: queries — find directo, no necesita aggregation
// Incluido como pipeline para consistencia con el backend
// ----------------------------------------------------------
const historialConsultasUsuario = (id_usuario_str) => [
  {
    $match: {
      id_usuario: ObjectId(id_usuario_str)
    }
  },
  {
    $sort: { fecha: -1 }
  },
  {
    $limit: 50
  },
  {
    $project: {
      texto_pregunta: 1,
      fecha: 1,
      "respuesta_llm.texto": 1,
      n_resultados: { $size: { $ifNull: ["$resultados", []] } }
    }
  }
];

// ----------------------------------------------------------
// AGG 2: Emociones dominantes de un usuario
// Colección: events — sin $lookup porque emocion está embebida
// ----------------------------------------------------------
const emocionDominanteUsuario = (id_usuario_str, dias = 365) => [
  {
    $match: {
      id_usuario: ObjectId(id_usuario_str),
      fecha_evento: {
        $gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    $group: {
      _id: "$emocion.nombre",
      veces: { $sum: 1 }
    }
  },
  {
    $sort: { veces: -1 }
  },
  {
    $project: {
      _id: 0,
      nombre_emocion: "$_id",
      veces: 1
    }
  }
];

// ----------------------------------------------------------
// AGG 3: Playlists con más canciones (de un usuario)
// Colección: playlists — $size sobre array embebido, sin $lookup
// ----------------------------------------------------------
const playlistsConMasCanciones = (id_usuario_str, limit = 10) => [
  {
    $match: {
      id_usuario: ObjectId(id_usuario_str)
    }
  },
  {
    $project: {
      titulo: 1,
      descripcion: 1,
      "portada.url": 1,
      n_canciones: { $size: { $ifNull: ["$canciones", []] } },
      fecha_creacion: 1
    }
  },
  {
    $sort: { n_canciones: -1 }
  },
  {
    $limit: limit
  }
];

// ===========================================================
// PRUEBA RÁPIDA — Verifica que las colecciones existen
// ===========================================================
print("\n=== Colecciones en spotify_rag ===");
db.getCollectionNames().forEach(c => print(" •", c));
print("\n=== Setup completo ✓ ===");