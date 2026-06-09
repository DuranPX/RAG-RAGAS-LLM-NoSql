const OpenAI = require("openai");
const { SongModel } = require("../models/Song");
const { ChunkModel } = require("../models/Chunk");
const AlbumModel = require("../models/Album");
const Query = require("../models/Query");
const { getCollections } = require("../config/db");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1/",
  apiKey: process.env.HUGGINGFACE_API_KEY || "missing_key",
});

const systemPrompt = `Eres MelodAI, un asistente virtual experto en la base de datos musical de SpotifyRAG.

TU ROL:
- Especialista en análisis de datos musicales
- Consultor de recomendaciones personalizadas
- Analista de tendencias de usuarios
- Experto en relaciones entre artistas, géneros, álbumes y canciones

BASE DE DATOS DISPONIBLE:
• Usuarios: Perfiles, planes de suscripción, tiempo de escucha
• Artistas: Nombres, países, descripciones, géneros asociados
• Géneros: Pop, Rock, Electronic, Alternative, R&B, Hip-Hop, etc.
• Álbumes: Títulos, años, descripciones, portadas, artistas
• Canciones: Títulos, letras, duraciones, géneros, álbumes
• Playlists: Listas personalizadas creadas por usuarios
• Emociones: Feliz, Triste, Nostalgia, Energía, Relajado, Enfocado

REGLAS DE RESPUESTA:
1. SIEMPRE usa el contexto proporcionado cuando esté disponible
2. Sé específico y basado en datos reales
3. Si no hay información suficiente, sugiere consultas específicas
4. Mantén un tono amigable pero profesional
5. Incorpora datos cuantitativos cuando sea posible
6. Los resultados están ordenados por relevancia estimada.
7. Analiza todos los resultados antes de responder.
8. No asumas que el primer resultado es necesariamente la mejor recomendación.
9. Si varios resultados son apropiados, compáralos y explica cuál parece más adecuado para la consulta.`;

// ─── HELPERS (implementaciones completas restauradas) ────────────────────────

function detectQueryType(texto) {
  if (!texto || typeof texto !== "string") return "semantic";
  const normalized = texto.toLowerCase();
  const entityPatterns = [
    "quién interpreta", "quien interpreta",
    "quién canta", "quien canta",
    "qué artista", "que artista",
    "a qué álbum", "a que álbum",
    "qué álbum", "que álbum",
    "quién lanzó", "quien lanzó",
    "qué género", "que género",
    "quién es el artista", "quien es el artista",
    "quién es el grupo", "quien es el grupo",
  ];
  return entityPatterns.some((p) => normalized.includes(p)) ? "entity" : "semantic";
}

function detectEmotion(texto) {
  if (!texto || typeof texto !== "string") return null;
  const t = texto.toLowerCase();
  const emociones = [
    "triste", "feliz", "nostalgia", "nostalgico", "nostálgico",
    "estres", "estrés", "relajado", "relajada",
    "energia", "energía", "enfocado", "enfocada",
  ];
  return emociones.find((e) => t.includes(e)) || null;
}

function extractEntity(texto) {
  if (!texto || typeof texto !== "string") return texto;
  return texto
    .replace(/¿/g, "")
    .replace(/\?/g, "")
    .replace(/quién interpreta/gi, "")
    .replace(/quien interpreta/gi, "")
    .replace(/quién canta/gi, "")
    .replace(/quien canta/gi, "")
    .replace(/qué artista/gi, "")
    .replace(/que artista/gi, "")
    .replace(/a qué álbum pertenece/gi, "")
    .replace(/a que album pertenece/gi, "")
    .replace(/qué álbum pertenece/gi, "")
    .replace(/que album pertenece/gi, "")
    .replace(/quién lanzó/gi, "")
    .replace(/quien lanzó/gi, "")
    .trim();
}

function normalizeText(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?]/g, "")
    .trim()
    .toLowerCase();
}

function classifyMetadataMatch(result, query) {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(result.titulo || "");
  if (!normalizedTitle) return "text";
  if (normalizedTitle === normalizedQuery) return "exact";
  if (normalizedTitle.includes(normalizedQuery)) return "phrase";
  return "text";
}

function buildSongEvidence(song, source, query) {
  const matchType = source === "metadata" ? classifyMetadataMatch(song, query) : null;
  const baseScore =
    source === "exact"
      ? 1.0
      : source === "metadata"
      ? matchType === "exact"
        ? 1.0
        : matchType === "phrase"
        ? 0.95
        : 0.85
      : source === "emotion"
      ? 0.9
      : source === "vector_song"
      ? (song.score || 0) * 0.7
      : 0;

  return {
    ...song,
    tipo: "cancion",
    source,
    matchType,
    score_final: Number(baseScore.toFixed(4)),
    score: song.score || 0,
  };
}

function buildChunkEvidence(chunk) {
  return {
    ...chunk,
    tipo: "chunk",
    source: "vector_chunk",
    score_final: Number(((chunk.score || 0) * 0.6).toFixed(4)),
    score: chunk.score || 0,
  };
}

function isValidEvidence(ev) {
  if (!ev) return false;
  if (ev.tipo === "cancion") return Boolean(ev.titulo || ev.artista?.nombre);
  if (ev.tipo === "chunk") return Boolean(ev.chunk_texto && ev.doc_id);
  if (ev.tipo === "artista") return Boolean(ev.artista?.nombre);
  if (ev.tipo === "album" || ev.tipo === "album_imagen")
    return Boolean(ev.titulo || ev.chunk_texto);
  return Boolean(
    ev.titulo || ev.chunk_texto || ev.nombre_artista || ev.artista?.nombre
  );
}

function mergeAndRerankEvidences(evidenceList, limit) {
  const merged = new Map();
  for (const ev of evidenceList) {
    if (!isValidEvidence(ev)) continue;
    let key = null;
    if (ev.tipo === "cancion") {
      key = ev._id ? `song:${ev._id.toString()}` : `song:${normalizeText(ev.titulo)}`;
    } else if (ev.tipo === "chunk") {
      key = ev._id
        ? `chunk:${ev._id.toString()}`
        : `chunk:${ev.doc_id?.toString() || normalizeText(ev.chunk_texto)}`;
    } else if (ev.tipo === "artista") {
      key = ev._id
        ? `artist:${ev._id.toString()}`
        : `artist:${normalizeText(ev.artista?.nombre)}`;
    } else if (ev.tipo === "album" || ev.tipo === "album_imagen") {
      key = ev._id ? `album:${ev._id.toString()}` : `album:${normalizeText(ev.titulo)}`;
    } else {
      key = `other:${JSON.stringify(ev)}`;
    }
    const existing = merged.get(key);
    if (!existing || ev.score_final > existing.score_final) {
      merged.set(key, ev);
    }
  }
  return Array.from(merged.values())
    .sort((a, b) => b.score_final - a.score_final)
    .slice(0, limit);
}

// ─── LLM ────────────────────────────────────────────────────────────────────

// modalidad: "texto" | "imagen" | "hibrido"
async function generarLLM(prompt, contexto = null, modalidad = "texto") {
  try {
    let user_content = prompt;

    if (contexto) {
      // Las reglas cambian según si hay una imagen identificada o no
      const esModalidadVisual = modalidad === "imagen" || modalidad === "hibrido";

      const reglasContexto = esModalidadVisual
        ? `INSTRUCCIONES CRÍTICAS PARA CONSULTA CON IMAGEN:
- El PRIMER resultado marcado como "★ ÁLBUM IDENTIFICADO VISUALMENTE" es el álbum de la imagen. Úsalo como referencia PRINCIPAL.
- Responde la pregunta del usuario sobre ESE álbum específico.
- Solo menciona los otros resultados si son directamente relevantes para la pregunta.
- NO digas que no tienes información si el primer resultado es claro.`
        : `INSTRUCCIONES:
- Usa el contexto proporcionado para responder con datos reales.
- Si existe coincidencia exacta con la pregunta, úsala como fuente principal.
- Si hay varios resultados relevantes, compáralos brevemente.`;

      user_content = `CONTEXTO DE LA BASE DE DATOS MUSICAL:
${reglasContexto}

${contexto}

PREGUNTA DEL USUARIO: ${prompt}.`;
    }

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user_content },
      ],
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      temperature: 0.15,
      max_tokens: 600,
      top_p: 0.92,
    });

    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("[ERROR LLM]", err);
    return `[ERROR LLM] ${err.message}`;
  }
}

// ─── FIX: albumImageVectorSearch usa getCollections() con nombre correcto ───
// IMPORTANTE: reemplaza "albumes" por el nombre EXACTO que retorna tu getCollections()
// Ejecuta esto en tu consola para saberlo: console.log(Object.keys(getCollections()))
async function albumImageVectorSearch(embedding, top_k) {
  const collections = getCollections();

  // Detecta el nombre real de la colección de álbumes
  // Prueba en orden: albumes → albums → album → Albums
  const albumCollection =
    collections.albumes ||
    collections.albums  ||
    collections.album   ||
    collections.Albums  ||
    null;

  if (!albumCollection) {
    console.error(
      "[albumImageVectorSearch] No se encontró colección de álbumes. Claves disponibles:",
      Object.keys(collections)
    );
    return [];
  }

  try {
    const results = await albumCollection.aggregate([
      {
        $vectorSearch: {
          index: "vector_idx_portada_imagen", // ← ajusta si tu índice tiene otro nombre
          path: "portada.emb_imagen",
          queryVector: embedding,
          numCandidates: top_k * 10,
          limit: top_k,
        },
      },
      {
        $project: {
          titulo: 1,
          id_artista: 1,
          anio_lanzamiento: 1,
          "portada.url": 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]).toArray();

    return results.map((r) => ({
      ...r,
      tipo: "album_imagen",
      tipo_fuente: "album_imagen",
      score_final: Number(((r.score || 0) * 0.85).toFixed(4)),
    }));
  } catch (err) {
    // Si el índice vectorial no existe aún, no rompe el resto del RAG
    console.error("[albumImageVectorSearch] Error en aggregate:", err.message);
    return [];
  }
}

// ─── RAG GLOBAL ─────────────────────────────────────────────────────────────

async function ragGlobal({ texto, embeddingTexto, embeddingImagen, top_k = 5, modalidad = "texto" }) {
  try {
    let evidencias = [];
    const queryType       = detectQueryType(texto);
    const emotionDetected = detectEmotion(texto);
    const entityName      = extractEntity(texto);
    const metadataQuery   = entityName || texto;

    const hasTextEmb  = Array.isArray(embeddingTexto)  && embeddingTexto.length  === 384;
    const hasImageEmb = Array.isArray(embeddingImagen) && embeddingImagen.length === 512;

    console.log("[QUERY TYPE]", queryType, "| ENTITY:", entityName || "N/A");
    console.log("[EMOTION]", emotionDetected || "N/A");
    console.log("[EMB TEXT]", hasTextEmb, "| [EMB IMAGE]", hasImageEmb);

    // Exact entity match (solo con texto)
    if (queryType === "entity" && entityName) {
      const exactSong = await SongModel.findExactTitle(entityName);
      if (exactSong) {
        console.log("[EXACT MATCH]", exactSong.titulo);
        evidencias = [buildSongEvidence(exactSong, "exact", metadataQuery)];
      }
    }

    if (evidencias.length === 0) {
      const [metadataResults, vectorSongResults, chunkResults, albumImageResults] =
        await Promise.all([
          SongModel.searchByMetadata(metadataQuery, top_k),

          hasTextEmb
            ? SongModel.vectorSearch(embeddingTexto, top_k)
            : Promise.resolve([]),

          hasTextEmb
            ? ChunkModel.vectorSearch(embeddingTexto, top_k)
            : Promise.resolve([]),

          hasImageEmb
            ? albumImageVectorSearch(embeddingImagen, top_k)
            : Promise.resolve([]),
        ]);

      console.log("[METADATA]",    metadataResults.length);
      console.log("[VEC SONG]",    vectorSongResults.length);
      console.log("[CHUNKS]",      chunkResults.length);
      console.log("[ALBUM IMAGE]", albumImageResults.length);

      const metadataEvidences = metadataResults.map((r) =>
        buildSongEvidence(r, "metadata", metadataQuery)
      );
      const vectorEvidences = vectorSongResults.map((r) =>
        buildSongEvidence(r, "vector_song", metadataQuery)
      );
      const chunkEvidences = chunkResults.map((r) => {
        const ev = buildChunkEvidence(r);
        ev.tipo = r.tipo_fuente || "chunk";
        return ev;
      });

      evidencias = mergeAndRerankEvidences(
        [...metadataEvidences, ...vectorEvidences, ...chunkEvidences, ...albumImageResults],
        top_k
      );
    }

    evidencias = evidencias.filter(isValidEvidence);

    if (evidencias.length === 0) {
      const respuesta = await generarLLM(texto, "No se encontraron coincidencias directas.");
      return { respuesta, evidencias: [], modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };
    }

    // Construcción de bloques de contexto
    let bloques = [];
    const collections = getCollections();
    const artistas =
      collections.artistas || collections.artists || collections.artista || null;
    const albumes =
      collections.albumes || collections.albums || collections.album || null;

    // FIX: rastrear si ya pusimos el álbum principal de imagen
    let primerAlbumImagenMarcado = false;

    for (const ev of evidencias) {
      const tipo = ev.tipo || ev.tipo_fuente;

      if (tipo === "cancion") {
        bloques.push(`CANCIÓN: ${ev.titulo || "Desconocido"}
• Artista: ${ev.artista?.nombre || "Desconocido"}
• Género: ${ev.genero || "No especificado"}
• Álbum: ${ev.album?.titulo || "Single"}
• Fragmento de Letra: ${ev.chunk_texto || "Cita referencial"}
• Relevancia: ${(ev.score_final || 0).toFixed(4)}`);

      } else if (tipo === "chunk") {
        bloques.push(`CHUNK: ${ev.chunk_texto || "Texto no disponible"}
• Relevancia Vectorial: ${(ev.score_final || 0).toFixed(4)}`);

      } else if (tipo === "album") {
        let tituloAlbum = "Desconocido";
        if (ev.doc_id && albumes) {
          const albData = await albumes.findOne({ _id: ev.doc_id });
          if (albData) tituloAlbum = albData.titulo;
        }
        bloques.push(`ÁLBUM: ${tituloAlbum}
• Texto: ${ev.chunk_texto || ""}
• Relevancia: ${(ev.score_final || 0).toFixed(4)}`);

      } else if (tipo === "album_imagen") {
        let nombreArtista = "Desconocido";
        if (ev.id_artista && artistas) {
          const artData = await artistas.findOne({ _id: ev.id_artista });
          if (artData) nombreArtista = artData.nombre;
        }
        // FIX: el primer album_imagen es la coincidencia visual directa — marcarlo explícitamente
        const esPrimario = !primerAlbumImagenMarcado;
        primerAlbumImagenMarcado = true;
        const etiqueta = esPrimario
          ? "★ ÁLBUM IDENTIFICADO VISUALMENTE (coincidencia principal de la imagen)"
          : "ÁLBUM ADICIONAL (menor similitud visual)";
        bloques.push(`${etiqueta}: ${ev.titulo || "Desconocido"}
• Artista: ${nombreArtista}
• Año: ${ev.anio_lanzamiento || "?"}
• Similitud visual: ${(ev.score_final || 0).toFixed(4)}${esPrimario ? " ← RESPONDE SOBRE ESTE ÁLBUM" : ""}`);

      } else if (tipo === "artista") {
        let nombreArtista = "Desconocido";
        if (ev.doc_id && artistas) {
          const artData = await artistas.findOne({ _id: ev.doc_id });
          if (artData) nombreArtista = artData.nombre;
        }
        bloques.push(`ARTISTA: ${nombreArtista}
• Extracto Biografía: ${ev.chunk_texto || ""}
• Relevancia: ${(ev.score_final || 0).toFixed(4)}`);
      }
    }

    const textoContexto =
      "\n\n" + "=".repeat(60) + "\n\n" +
      bloques.join("\n\n") +
      "\n" + "=".repeat(60);

    const respuesta = await generarLLM(texto, textoContexto, modalidad);
    return { respuesta, evidencias, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };

  } catch (error) {
    console.error("Error en ragGlobal:", error);
    throw new Error(`ERROR en RAG Global: ${error.message}`);
  }
}

// ─── MICROSERVICIOS PYTHON ───────────────────────────────────────────────────

async function obtenerEmbeddingTextoLocal(texto) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/embed/texto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error microservicio python (texto):", error);
    return null;
  }
}

async function obtenerEmbeddingImagenLocal(base64) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/embed/imagen_base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64 }),
    });
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error microservicio python (imagen):", error);
    return null;
  }
}

// ─── WRAP AND SAVE ───────────────────────────────────────────────────────────

async function wrapAndSaveQuery({
  texto, embeddingTexto, embeddingImagen,
  tipo_consulta, tiene_imagen, ragResult,
}) {
  const { respuesta, evidencias, modelo_usado } = ragResult;
  const embedding = embeddingTexto || embeddingImagen;

  const mappedResultados = evidencias.map((ev) => ({
    id_cancion:      ev.tipo === "cancion"      && ev._id ? ev._id : null,
    id_album:        ev.tipo === "album_imagen" && ev._id ? ev._id : null,
    titulo:          ev.titulo || null,
    nombre_artista:  ev.artista?.nombre || null,
    tipo_fuente:     ev.tipo || ev.tipo_fuente || null,
    score_similitud: ev.score_final ?? ev.score ?? null,
  }));

  const chunks_usados = evidencias
    .filter((ev) => ev.tipo_fuente)
    .map((ev) => ev._id);

  const queryCreated = await Query.create({
    texto_pregunta:   texto,
    vector_embedding: embedding,
    modelo_embedding: embeddingImagen ? "clip-ViT-B-32" : "all-MiniLM-L6-v2",
    tipo_consulta,
    tiene_imagen,
    resultados: mappedResultados,
  });

  await Query.guardarRespuesta(queryCreated._id, {
    texto: respuesta,
    modelo_usado,
    chunks_usados,
  });

  return ragResult;
}

// ─── CONTROLADORES ───────────────────────────────────────────────────────────

exports.textoTexto = async (req, res) => {
  const { texto } = req.body;
  if (!texto) throw new Error("Se requiere el campo 'texto'");

  const embeddingTexto = await obtenerEmbeddingTextoLocal(texto);
  const result = await ragGlobal({ texto, embeddingTexto, embeddingImagen: null, modalidad: "texto" });

  await wrapAndSaveQuery({
    texto, embeddingTexto, embeddingImagen: null,
    tipo_consulta: "texto-texto", tiene_imagen: false, ragResult: result,
  });

  return result;
};

exports.imagenTexto = async (req, res) => {
  const { prompt, imageBase64 } = req.body;
  if (!imageBase64) throw new Error("Se requiere el campo 'imageBase64'");

  const embeddingImagen = await obtenerEmbeddingImagenLocal(imageBase64);
  const texto = prompt || "¿Qué álbum aparece en esta imagen?";
  const result = await ragGlobal({ texto, embeddingTexto: null, embeddingImagen, modalidad: "imagen" });

  await wrapAndSaveQuery({
    texto, embeddingTexto: null, embeddingImagen,
    tipo_consulta: "imagen-texto", tiene_imagen: true, ragResult: result,
  });

  return result;
};

exports.hibrido = async (req, res) => {
  const { texto, imageBase64 } = req.body;

  const [embeddingTexto, embeddingImagen] = await Promise.all([
    texto       ? obtenerEmbeddingTextoLocal(texto)        : Promise.resolve(null),
    imageBase64 ? obtenerEmbeddingImagenLocal(imageBase64) : Promise.resolve(null),
  ]);

  const finalPrompt = texto || "Consulta híbrida: identifica el álbum y canciones relacionadas";

  const result = await ragGlobal({
    texto: finalPrompt,
    embeddingTexto,
    embeddingImagen,
    top_k: 8,
    modalidad: "hibrido",
  });

  await wrapAndSaveQuery({
    texto: finalPrompt,
    embeddingTexto,
    embeddingImagen,
    tipo_consulta: "hibrido",
    tiene_imagen: Boolean(imageBase64),
    ragResult: result,
  });

  return result;
};