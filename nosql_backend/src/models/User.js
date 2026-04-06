const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validateUsuario({ nombre, correo, plan_suscripcion }) {
  const errores = [];
  if (!nombre || typeof nombre !== "string") errores.push("nombre requerido");
  if (!correo || !/^[^@]+@[^@]+\.[^@]+$/.test(correo)) errores.push("correo inválido");
  if (!["free", "premium", "family"].includes(plan_suscripcion)) {
    errores.push("plan_suscripcion debe ser free, premium o family");
  }
  return errores;
}

class User {

  static async findAll() {
    const { usuarios } = getCollections();
    return usuarios.find({}).toArray();
  }

  static async findById(id) {
    const { usuarios } = getCollections();
    return usuarios.findOne({ _id: new ObjectId(id) });
  }

  static async create({ nombre, correo, plan_suscripcion = "free", portada = null }) {
    const errores = validateUsuario({ nombre, correo, plan_suscripcion });
    if (errores.length) throw { status: 400, errores };

    const { usuarios } = getCollections();

    const doc = {
      nombre,
      correo,
      plan_suscripcion,
      tiempo_escucha: 0,
      portada,
      fecha_registro: new Date(),
    };

    const result = await usuarios.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  static async incrementarTiempo(id, minutos) {
    if (!minutos || minutos <= 0) throw { status: 400, errores: ["minutos debe ser > 0"] };

    const { usuarios } = getCollections();
    const result = await usuarios.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { tiempo_escucha: minutos } },
      { returnDocument: "after", projection: { tiempo_escucha: 1 } }
    );

    if (!result) throw { status: 404, errores: ["Usuario no encontrado"] };
    return result;
  }

  static async emocionDominante(id, dias = 365) {
    const { eventos } = getCollections();

    const pipeline = [
      {
        $match: {
          id_usuario: new ObjectId(id),
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
      { $sort: { veces: -1 } },
      {
        $project: {
          _id: 0,
          nombre_emocion: "$_id",
          veces: 1
        }
      }
    ];

    return eventos.aggregate(pipeline).toArray();
  }

  static async topArtistas(id, limit = 10) {
    const { eventos } = getCollections();

    const pipeline = [
      { $match: { id_usuario: new ObjectId(id) } },
      {
        $group: {
          _id: "$cancion_snapshot.nombre_artista",
          veces: { $sum: 1 }
        }
      },
      { $sort: { veces: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          nombre_artista: "$_id",
          veces: 1
        }
      }
    ];

    return eventos.aggregate(pipeline).toArray();
  }

  static async getStats() {
    const { usuarios } = getCollections();
    const totalCount = await usuarios.countDocuments();
    
    if (totalCount === 0) {
      return {
        total_usuarios: 0,
        suscripciones: { free: 0, premium: 0, family: 0 },
        promedio_tiempo_escucha: 0,
        historial_promedio: 0,
        mensaje: "No hay metricas registradas"
      };
    }

    const pipeline = [
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          free_count: { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "free"] }, 1, 0] } },
          premium_count: { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "premium"] }, 1, 0] } },
          family_count: { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "family"] }, 1, 0] } },
          total_tiempo: { $sum: { $ifNull: ["$tiempo_escucha", 0] } },
          total_historial: { $sum: { $size: { $ifNull: ["$historial_reciente", []] } } }
        }
      },
      {
        $project: {
          _id: 0,
          total_usuarios: "$total",
          suscripciones: {
            free: { $round: [{ $multiply: [{ $divide: ["$free_count", "$total"] }, 100] }, 1] },
            premium: { $round: [{ $multiply: [{ $divide: ["$premium_count", "$total"] }, 100] }, 1] },
            family: { $round: [{ $multiply: [{ $divide: ["$family_count", "$total"] }, 100] }, 1] }
          },
          promedio_tiempo_escucha: { $round: [{ $divide: ["$total_tiempo", "$total"] }, 1] },
          historial_promedio: { $round: [{ $divide: ["$total_historial", "$total"] }, 1] }
        }
      }
    ];

    const result = await usuarios.aggregate(pipeline).toArray();
    return result[0];
  }
}

module.exports = User;