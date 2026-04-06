const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validateQuery({ texto_pregunta }) {
  const errores = [];
  if (!texto_pregunta || typeof texto_pregunta !== "string") {
    errores.push("texto_pregunta requerido");
  }
  return errores;
}

class Query {

  static async create({
    id_usuario = null,
    texto_pregunta,
    vector_embedding = null,
    modelo_embedding = "all-MiniLM-L6-v2",
    tipo_consulta = "texto-texto",
    tiene_imagen = false,
    resultados = []
  }) {
    const errores = validateQuery({ texto_pregunta });
    if (errores.length) throw { status: 400, errores };

    const { consultas, usuarios } = getCollections();

    // Lógica para usuario estático: si no pasan ID, asignamos el primero que encontremos
    let finalUserId = id_usuario;
    if (!finalUserId) {
      const mockUser = await usuarios.findOne({});
      if (mockUser) finalUserId = mockUser._id;
    } else {
      finalUserId = new ObjectId(id_usuario);
    }

    const doc = {
      id_usuario: finalUserId,
      texto_pregunta,
      fecha: new Date(),
      tipo_consulta,
      tiene_imagen,
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
      chunks_usados: chunks_usados.map(cid => new ObjectId(cid))
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