const OpenAI = require("openai");
const { SongModel } = require("../models/Song");
const { ChunkModel } = require("../models/Chunk");
const AlbumModel = require("../models/Album");
const Query = require("../models/Query");
const { getCollections } = require("../config/db");

// Inicializamos cliente OpenAI apuntando a Hugging Face Serverless Inference
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
5. Incorpora datos cuantitativos cuando sea posible`;

async function generarLLM(prompt, contexto = null) {
  try {
    let user_content = prompt;
    if (contexto) {
      user_content = `CONTEXTO EXTRAÍDO DE LA BASE DE DATOS MEDIANTE BÚSQUEDA VECTORIAL:
A continuación se muestran los resultados obtenidos, ordenados de MAYOR a MENOR relevancia. 
El primer registro es la coincidencia más exacta a la imagen o texto que el usuario ha proporcionado.

${contexto}

PREGUNTA DEL USUARIO: ${prompt}

Analiza este contexto con la regla en mente de que el primer elemento es el más probable y responde la pregunta de manera precisa.`;
    }

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user_content }
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

/**
 * Función Principal de RAG para embeddings pasados desde el cliente (o extraídos manualmente)
 */
async function ragGlobal({ texto, embedding, top_k = 5 }) {
  try {
    let evidencias = [];

    if (embedding && Array.isArray(embedding)) {
      if (embedding.length === 384) {
        const evCanciones = await SongModel.vectorSearch(embedding, top_k);
        const evChunks = await ChunkModel.vectorSearch(embedding, top_k);

        evCanciones.forEach(e => { e.tipo = 'cancion'; evidencias.push(e); });
        evChunks.forEach(e => { evidencias.push(e); });
      } else if (embedding.length === 512) {
        const evAlbums = await AlbumModel.vectorSearch(embedding, top_k);
        evAlbums.forEach(e => { e.tipo = 'album_imagen'; evidencias.push(e); });
      }
    }

    if (evidencias.length === 0) {
      const respuesta = await generarLLM(texto, "No se encontraron coincidencias vectoriales directas.");
      return { respuesta, evidencias: [], modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };
    }

    // Construir contexto unificado
    let bloques = [];
    const { artistas, albumes } = getCollections(); 

    for (const ev of evidencias) {
      const tipo = ev.tipo || ev.tipo_fuente;

      if (tipo === 'cancion') {
        const bloque = `CANCIÓN: ${ev.titulo || 'Desconocido'}
• Artista: ${ev.artista?.nombre || 'Desconocido'}
• Género: ${ev.genero || 'No especificado'}
• Álbum: ${ev.album?.titulo || 'Single'}
• Fragmento de Letra / Cita: ${ev.chunk_texto || 'Cita referencial'}
• Relevancia Vectorial: ${(ev.score || 0).toFixed(4)}`;
        bloques.push(bloque);
      }
      else if (tipo === 'album') {
        let tituloAlbum = 'Desconocido';
        if (ev.doc_id) {
          const albData = await albumes.findOne({ _id: ev.doc_id });
          if (albData) tituloAlbum = albData.titulo;
        }

        const bloque = `ÁLBUM: ${tituloAlbum}
• Texto descriptivo asociado u ocurrencia: ${ev.chunk_texto || ''}
• Relevancia Vectorial: ${(ev.score || 0).toFixed(4)}`;
        bloques.push(bloque);
      }
      else if (tipo === 'album_imagen') {
        let nombreArtista = 'Desconocido';
        if (ev.id_artista) {
          const artData = await artistas.findOne({ _id: ev.id_artista });
          if (artData) nombreArtista = artData.nombre;
        }
        const bloque = `ÁLBUM (Identificado visualmente de la portada): ${ev.titulo || 'Desconocido'}
• Artista: ${nombreArtista}
• Relevancia Vectorial Visual: ${(ev.score || 0).toFixed(4)}`;
        bloques.push(bloque);
      }
      else if (tipo === 'artista') {
        let nombreArtista = 'Desconocido';
        if (ev.doc_id) {
          const artData = await artistas.findOne({ _id: ev.doc_id });
          if (artData) nombreArtista = artData.nombre;
        }

        const bloque = `ARTISTA: ${nombreArtista}
• Extracto de Biografía/Mención: ${ev.chunk_texto || ''}
• Relevancia Vectorial: ${(ev.score || 0).toFixed(4)}`;
        bloques.push(bloque);
      }
    }

    const textoContexto = "\n\n" + "=".repeat(60) + "\n\n" + bloques.join("\n\n") + "\n" + "=".repeat(60);

    const respuesta = await generarLLM(texto, textoContexto);

    return { respuesta, evidencias, modelo_usado: "meta-llama/Meta-Llama-3-8B-Instruct" };

  } catch (error) {
    console.error("Error en ragGlobal:", error);
    throw new Error(`ERROR en RAG Global: ${error.message}`);
  }
}

// Funciones utilitarias para comunicarse con el Python Microservice
async function obtenerEmbeddingTextoLocal(texto) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/embed/texto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error contactando microservicio python (texto):", error);
    return null;
  }
}

async function obtenerEmbeddingImagenLocal(base64) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/embed/imagen_base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64 })
    });
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error contactando microservicio python (imagen):", error);
    return null;
  }
}

// --- Middlewares/Wrappers para Inserción Automática en MongoDB Queries ---
async function wrapAndSaveQuery({ texto, embedding, tipo_consulta, tiene_imagen, ragResult }) {
  const { respuesta, evidencias, modelo_usado } = ragResult;
  
  // Extraemos mapeo compatible de evidencias para DB
  const mappedResultados = evidencias.map(ev => ({
    id_cancion: ev.tipo === 'cancion' && ev._id ? ev._id : null,
    id_album: ev.tipo === 'album_imagen' && ev._id ? ev._id : null,
    titulo: ev.titulo || null,
    nombre_artista: ev.artista?.nombre || null,
    tipo_fuente: ev.tipo || ev.tipo_fuente || null,
    score_similitud: ev.score || null
  }));

  const chunks_usados = evidencias
    .filter(ev => ev.tipo_fuente) // Es decir, vino de Colección Chunks
    .map(ev => ev._id);

  // 1. Crear documento de consulta
  const queryCreated = await Query.create({
    texto_pregunta: texto,
    vector_embedding: embedding,
    modelo_embedding: embedding && embedding.length === 512 ? "clip-ViT-B-32" : "all-MiniLM-L6-v2",
    tipo_consulta,
    tiene_imagen,
    resultados: mappedResultados
  });

  // 2. Adjuntarle la respuesta
  await Query.guardarRespuesta(queryCreated._id, {
    texto: respuesta,
    modelo_usado: modelo_usado,
    chunks_usados
  });

  return ragResult;
}

// Controladores para pasar al Express Router
exports.textoTexto = async (req, res) => {
  const { texto } = req.body;
  if (!texto) throw new Error("Se requiere el campo 'texto'");

  const embedding = await obtenerEmbeddingTextoLocal(texto);
  const result = await ragGlobal({ texto, embedding });
  
  await wrapAndSaveQuery({
    texto,
    embedding,
    tipo_consulta: "texto-texto",
    tiene_imagen: false,
    ragResult: result
  });

  return result;
};

exports.imagenTexto = async (req, res) => {
  const { prompt, imageBase64 } = req.body;
  if (!imageBase64) throw new Error("Se requiere el campo 'imageBase64'");

  const embedding = await obtenerEmbeddingImagenLocal(imageBase64);
  const finalPrompt = prompt || "Analiza esta imagen devolviendome el titulo u otra informacion";
  const result = await ragGlobal({ texto: finalPrompt, embedding });
  
  await wrapAndSaveQuery({
    texto: finalPrompt,
    embedding,
    tipo_consulta: "imagen-texto",
    tiene_imagen: true,
    ragResult: result
  });

  return result;
};

exports.hibrido = async (req, res) => {
  const { texto, imageBase64 } = req.body;

  let embedding = null;
  let tiene_imagen = false;
  if (imageBase64) {
    embedding = await obtenerEmbeddingImagenLocal(imageBase64);
    tiene_imagen = true;
  } else if (texto) {
    embedding = await obtenerEmbeddingTextoLocal(texto);
  }

  const finalPrompt = texto || "Consulta Híbrida";
  const result = await ragGlobal({ texto: finalPrompt, embedding, top_k: 8 });
  
  await wrapAndSaveQuery({
    texto: finalPrompt,
    embedding,
    tipo_consulta: "hibrido",
    tiene_imagen,
    ragResult: result
  });

  return result;
};
