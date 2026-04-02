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

  static async create({
    id_usuario,
    texto_pregunta,
    vector_embedding = null,
    modelo_embedding = "all-MiniLM-L6-v2",
    resultados = []
  }) {
    const errores = validateQuery({ id_usuario, texto_pregunta });
    if (errores.length) throw { status: 400, errores };

    const { consultas } = getCollections();

    const doc = {
      id_usuario: new ObjectId(id_usuario),
      texto_pregunta,
      fecha: new Date(),
      vector_embedding,
      modelo_embedding,
      resultados,
      respuesta_llm: null
    };

    const result = await consultas.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  static async guardarRespuesta(id, { texto, modelo_usado, chunks_usados = [] }) {
    const { consultas } = getCollections();

    const respuesta_llm = {
      texto,
      modelo_usado,
      fecha_generacion: new Date(),
      chunks_usados: chunks_usados.map(id => new ObjectId(id))
    };

    const result = await consultas.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { respuesta_llm } },
      { returnDocument: "after" }
    );

    if (!result) throw { status: 404, errores: ["Consulta no encontrada"] };
    return result;
  }

  // Excluye vector_embedding del resultado
  static async historialPorUsuario(id_usuario, limit = 50) {
    const { consultas } = getCollections();

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
          vector_embedding: 0
        }
      }
    ];

    return consultas.aggregate(pipeline).toArray();
  }

  static async findById(id) {
    const { consultas } = getCollections();
    return consultas.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = Query;