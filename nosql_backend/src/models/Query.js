// Colapsa: consulta + query_embedding + resultados en un solo documento

const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validateQuery({ id_usuario, texto_pregunta }) {
  const errores = [];
  if (!id_usuario) errores.push("id_usuario requerido");
  if (!texto_pregunta || typeof texto_pregunta !== "string") {
    errores.push("texto_pregunta requerido");
  }
  return errores;
}

class Query {

  // CREATE QUERY
  // El vector llega ya generado desde el microservicio Python
  // Python envía POST /api/queries con { vector_embedding: float[384] }
  // Reemplaza: crear_consulta_con_embedding_atomic (RPC Supabase)
  static async create({
    id_usuario,
    texto_pregunta,
    vector_embedding = null,
    modelo_embedding = "all-MiniLM-L6-v2",
    resultados = []
  }) {
    const errores = validateQuery({ id_usuario, texto_pregunta });
    if (errores.length) throw { status: 400, errores };

    const { queries } = getCollections();

    const doc = {
      id_usuario: new ObjectId(id_usuario),
      texto_pregunta,
      fecha: new Date(),
      vector_embedding,          
      modelo_embedding,
      resultados,                // [{ id_cancion, titulo, nombre_artista, score_similitud }]
      respuesta_llm: null        // se actualiza con guardarRespuesta()
    };

    const result = await queries.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  // GUARDAR RESPUESTA LLM
  // Se llama después de que el LLM genera la respuesta
  // chunks_usados - ObjectIds de la colección chunks (referenciados)
  // Sirve como contexto para evaluación RAGAS
  static async guardarRespuesta(id, { texto, modelo_usado, chunks_usados = [] }) {
    const { queries } = getCollections();

    const respuesta_llm = {
      texto,
      modelo_usado,                                          
      fecha_generacion: new Date(),
      chunks_usados: chunks_usados.map(id => new ObjectId(id))  
    };

    const result = await queries.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { respuesta_llm } },
      { returnDocument: "after" }
    );

    if (!result) throw { status: 404, errores: ["Consulta no encontrada"] };
    return result;
  }

  // HISTORIAL POR USUARIO — Aggregation 1
  // El vector NO se devuelve al cliente (pesado e innecesario)
  // Reemplaza: get_consultas_usuario (RPC Supabase)
  static async historialPorUsuario(id_usuario, limit = 50) {
    const { queries } = getCollections();

    const pipeline = [
      { $match: { id_usuario: new ObjectId(id_usuario) } },
      { $sort: { fecha: -1 } },
      { $limit: limit },
      {
        $project: {
          texto_pregunta: 1,
          fecha: 1,
          modelo_embedding: 1,
          "respuesta_llm.texto": 1,
          "respuesta_llm.modelo_usado": 1,
          "respuesta_llm.fecha_generacion": 1,
          n_resultados: { $size: { $ifNull: ["$resultados", []] } },
          vector_embedding: 0    // excluido — el cliente no lo necesita
        }
      }
    ];

    return queries.aggregate(pipeline).toArray();
  }

  // FIND BY ID — detalle completo (incluye vector y chunks)
  // Solo para uso interno del pipeline RAG
  static async findById(id) {
    const { queries } = getCollections();
    return queries.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = Query;