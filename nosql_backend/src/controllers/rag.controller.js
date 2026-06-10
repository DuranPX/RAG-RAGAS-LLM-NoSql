const OpenAI = require("openai");
const { ObjectId } = require("mongodb");
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
9. Si varios resultados son apropiados, compáralos y explica cuál parece más adecuado para la consulta.
10. NUNCA inventes canciones, artistas, álbumes o datos que no aparezcan en el contexto proporcionado.
11. Si el contexto no contiene suficiente información para responder con precisión, dilo explícitamente en lugar de completar con conocimiento externo.
12. Si el usuario menciona una época o año específico, solo recomienda canciones cuyo año en el contexto coincida. Si ningún resultado coincide con el período, indícalo honestamente.`;

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
    chunk_texto: song.chunk_texto || song.letra_fragmento || null,
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
      temperature: 0.05,
      max_tokens: 600,
      top_p: 0.92,
    });

    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("[ERROR LLM]", err);
    return `[ERROR LLM] ${err.message}`;
  }
}

// FIX: albumImageVectorSearch usa getCollections() con nombre correcto 

async function albumImageVectorSearch(embedding, top_k) {
  const collections = getCollections();
  const albumCollection =
    collections.albumes ||
    collections.albums ||
    collections.album ||
    collections.Albums ||
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
          index: "vector_idx_portada_imagen",
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
    const queryType = detectQueryType(texto);
    const emotionDetected = detectEmotion(texto);
    const entityName = extractEntity(texto);
    const metadataQuery = entityName || texto;

    const hasTextEmb = Array.isArray(embeddingTexto) && embeddingTexto.length === 384;
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

      console.log("[METADATA]", metadataResults.length);
      console.log("[VEC SONG]", vectorSongResults.length);
      console.log("[CHUNKS]", chunkResults.length);
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

      const topChunks = chunkEvidences
        .sort((a, b) => b.score_final - a.score_final)
        .slice(0, 3);

      // CORRECTO
      evidencias = [
        ...mergeAndRerankEvidences(
          [...metadataEvidences, ...vectorEvidences, ...albumImageResults],
          top_k
        ),
        ...topChunks,
      ];
    }

    evidencias = evidencias.filter(isValidEvidence);

    if (evidencias.length === 0) {
      const respuesta = await generarLLM(texto, "No se encontraron coincidencias directas.");
      return { respuesta, evidencias: [], modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };
    }

    // Construcción de bloques de contexto
    let bloques = [];
    // Al inicio de bloques[], antes del for loop en ragGlobal
    if (emotionDetected) {
      bloques.unshift(`FILTRO EMOCIONAL DETECTADO: "${emotionDetected}" — prioriza canciones con esa emoción.`);
    }
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
        const anioAlbum = ev.album?.anio || ev.album?.anio_lanzamiento || ev.anio_lanzamiento || null;

        bloques.push(`CANCIÓN: ${ev.titulo || "Desconocido"}
- Artista: ${ev.artista?.nombre || "Desconocido"}
- Género: ${ev.genero || "No especificado"}
- Álbum: ${ev.album?.titulo || "Single"} ${anioAlbum ? `(${anioAlbum})` : "(año desconocido)"}
${ev.chunk_texto ? `• Fragmento: ${ev.chunk_texto}` : "• Sin fragmento de letra disponible"}
- Relevancia: ${(ev.score_final || 0).toFixed(4)}`);

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

  // 🔍 DEBUG 1: Ver qué evidencias llegan
  console.log("[WRAP DEBUG] tipo_consulta:", tipo_consulta);
  console.log("[WRAP DEBUG] evidencias count:", evidencias.length);
  console.log("[WRAP DEBUG] evidencias tipos:", evidencias.map(e => ({
    tipo: e.tipo,
    tipo_fuente: e.tipo_fuente,
    _id: e._id,
    titulo: e.titulo,
    score_final: e.score_final,
    score: e.score,
  })));

  const mappedResultados = evidencias.map((ev) => {
    const tipo = ev.tipo || ev.tipo_fuente || null;
    const esAlbum = tipo === "album_imagen" || tipo === "album";
    const esCancion = tipo === "cancion";

    return {
      id_cancion: esCancion && ev._id
        ? (ev._id instanceof ObjectId ? ev._id : new ObjectId(ev._id))
        : null,
      id_album: esAlbum && ev._id
        ? (ev._id instanceof ObjectId ? ev._id : new ObjectId(ev._id))
        : null,
      titulo: ev.titulo || null,
      nombre_artista: ev.artista?.nombre || null,
      tipo_fuente: tipo,
      score_similitud: ev.score_final ?? ev.score ?? null,
    };
  });

  // 🔍 DEBUG 2: Ver el documento mapeado antes de insertar
  console.log("[WRAP DEBUG] mappedResultados:", JSON.stringify(mappedResultados, null, 2));

  const chunks_usados = evidencias
    .filter((ev) => (ev.tipo || ev.tipo_fuente) === "chunk")
    .map((ev) => ev._id);

  console.log("[WRAP DEBUG] chunks_usados:", chunks_usados);

  // 🔍 DEBUG 3: Ver el documento completo que va a insertarse
  const docAInsertar = {
    texto_pregunta: texto,
    vector_embedding: embedding ? `[Array de ${embedding.length} dims]` : null,
    modelo_embedding: embeddingImagen ? "clip-ViT-B-32" : "all-MiniLM-L6-v2",
    tipo_consulta,
    tiene_imagen,
    resultados: mappedResultados,
  };
  console.log("[WRAP DEBUG] doc a insertar:", JSON.stringify(docAInsertar, null, 2));

  let queryCreated;
  try {
    queryCreated = await Query.create({
      texto_pregunta: texto,
      vector_embedding: embedding,
      modelo_embedding: embeddingImagen ? "clip-ViT-B-32" : "all-MiniLM-L6-v2",
      tipo_consulta,
      tiene_imagen,
      resultados: mappedResultados,
    });
    console.log("[WRAP DEBUG] Query.create OK, _id:", queryCreated._id);
  } catch (createErr) {
    // 🔍 DEBUG 4: Error específico del create
    console.error("[WRAP DEBUG] FALLO en Query.create:");
    console.error("[WRAP DEBUG] message:", createErr.message);
    console.error("[WRAP DEBUG] code:", createErr.code);
    console.error("[WRAP DEBUG] errInfo:", JSON.stringify(createErr.errInfo, null, 2));
    throw createErr;
  }

  try {
    await Query.guardarRespuesta(queryCreated._id, {
      texto: respuesta,
      modelo_usado,
      chunks_usados,
    });
    console.log("[WRAP DEBUG] guardarRespuesta OK");
  } catch (respErr) {
    // 🔍 DEBUG 5: Error específico del guardarRespuesta
    console.error("[WRAP DEBUG] FALLO en guardarRespuesta:");
    console.error("[WRAP DEBUG] message:", respErr.message);
    console.error("[WRAP DEBUG] code:", respErr.code);
    console.error("[WRAP DEBUG] errInfo:", JSON.stringify(respErr.errInfo, null, 2));
    throw respErr;
  }

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
    texto ? obtenerEmbeddingTextoLocal(texto) : Promise.resolve(null),
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

exports.imagenImagen = async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) throw new Error("Se requiere el campo 'imageBase64'");

  const embeddingImagen = await obtenerEmbeddingImagenLocal(imageBase64);
  if (!embeddingImagen) throw new Error("No se pudo generar el embedding de la imagen");

  let evAlbums = [];
  try {
    evAlbums = await albumImageVectorSearch(embeddingImagen, 5);
  } catch (searchErr) {
    console.error("[ERROR vectorSearch imagen-imagen]", searchErr.message);
  }

  const collections = getCollections();
  const artistas = collections.artistas || collections.artists || collections.artista || null;

  const resultados = await Promise.all(evAlbums.map(async (album) => {
    let nombreArtista = "Desconocido";
    if (album.id_artista && artistas) {
      const artData = await artistas.findOne({ _id: album.id_artista });
      if (artData) nombreArtista = artData.nombre;
    }
    return {
      id_album: album._id,
      titulo: album.titulo || "Desconocido",
      artista: nombreArtista,
      portada_url: album.portada?.url || null,
      score_similitud: album.score_final ?? album.score ?? 0,
    };
  }));

  const contexto = resultados.length > 0
    ? resultados.map((r, i) =>
      `${i + 1}. ÁLBUM: ${r.titulo} — Artista: ${r.artista} (score: ${r.score_similitud.toFixed(4)})`
    ).join("\n")
    : "No se encontraron álbumes visualmente similares en la base de datos.";

  const respuesta = await generarLLM(
    "El usuario envió una imagen de portada. Describe qué álbumes son visualmente similares y por qué.",
    contexto,
    "imagen"  // ← modalidad explícita
  );

  try {
    await wrapAndSaveQuery({
      texto: "Búsqueda imagen-imagen",
      embeddingTexto: null,
      embeddingImagen,
      tipo_consulta: "imagen-imagen",
      tiene_imagen: true,
      ragResult: { respuesta, evidencias: evAlbums, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" },
    });
  } catch (saveErr) {
    console.error("[WARN] No se pudo guardar consulta imagen-imagen:", saveErr.message);
  }

  return { respuesta, resultados, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };
};

exports.textoImagen = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) throw new Error("Se requiere el campo 'prompt'");

  let embeddingCLIP = null;
  try {
    const response = await fetch("http://127.0.0.1:5000/api/embed/texto_a_imagen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: prompt }),
    });
    const data = await response.json();
    embeddingCLIP = data.embedding;
  } catch (fetchErr) {
    console.error("[ERROR microservicio texto_a_imagen]", fetchErr.message);
  }

  if (!embeddingCLIP) throw new Error("No se pudo obtener embedding CLIP del texto");

  let evAlbums = [];
  try {
    evAlbums = await albumImageVectorSearch(embeddingCLIP, 5);
  } catch (searchErr) {
    console.error("[ERROR vectorSearch texto-imagen]", searchErr.message);
  }

  const collections = getCollections();
  const artistas = collections.artistas || collections.artists || collections.artista || null;

  const resultados = await Promise.all(evAlbums.map(async (album) => {
    let nombreArtista = "Desconocido";
    if (album.id_artista && artistas) {
      const artData = await artistas.findOne({ _id: album.id_artista });
      if (artData) nombreArtista = artData.nombre;
    }
    return {
      id_album: album._id,
      titulo: album.titulo || "Desconocido",
      artista: nombreArtista,
      portada_url: album.portada?.url || null,
      score_similitud: album.score_final ?? album.score ?? 0,
    };
  }));

  const contexto = resultados.length > 0
    ? resultados.map((r, i) =>
      `${i + 1}. ÁLBUM: ${r.titulo} — Artista: ${r.artista} (score: ${r.score_similitud.toFixed(4)})`
    ).join("\n")
    : "No se encontraron álbumes con portadas similares a esa descripción.";

  const respuesta = await generarLLM(prompt, contexto, "texto");

  try {
    await wrapAndSaveQuery({
      texto: prompt,
      embeddingTexto: null,
      embeddingImagen: embeddingCLIP,
      tipo_consulta: "texto-imagen",
      tiene_imagen: false,
      ragResult: { respuesta, evidencias: evAlbums, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" },
    });
  } catch (saveErr) {
    console.error("[WARN] No se pudo guardar consulta texto-imagen:", saveErr.message);
  }

  return { respuesta, resultados, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };
};