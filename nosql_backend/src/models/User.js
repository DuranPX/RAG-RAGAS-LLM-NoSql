// Driver nativo mongodb
// Cada método estático reemplaza un RPC de Supabase

const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

// Validación básica de campos requeridos antes de tocar la DB
function validateUsuario({ nombre, correo, plan_suscripcion }) {
  const errores = [];
  if (!nombre || typeof nombre !== "string") errores.push("nombre requerido");
  if (!correo || !/^[^@]+@[^@]+\.[^@]+$/.test(correo)) errores.push("correo inválido"); //regex minimo
  if (!["free", "premium", "family"].includes(plan_suscripcion)) {
    errores.push("plan_suscripcion debe ser free, premium o family");
  }
  return errores;
}

class User {

  // FIND BY ID
  // Operación simple — find directo, sin $lookup 
  static async findById(id) {
    const { usuarios } = getCollections();
    return usuarios.findOne({ _id: new ObjectId(id) });
  }
  // CREATE
  // portada embebida con URL iTunes — sin bucket
  static async create({ nombre, correo, plan_suscripcion = "free", portada = null }) {
    const errores = validateUsuario({ nombre, correo, plan_suscripcion });
    if (errores.length) throw { status: 400, errores };

    const { usuarios } = getCollections();

    const doc = {
      nombre,
      correo,
      plan_suscripcion,
      tiempo_escucha: 0,
      portada,              // es la url, les recuerdo
      fecha_registro: new Date(),
    };

    const result = await usuarios.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  // INCREMENTAR TIEMPO DE ESCUCHA - es valor agregado del SQL
  // Reemplaza: incrementar_tiempo_escucha_atomic (RPC Supabase)
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

  // EMOCIÓN DOMINANTE
  // Aggregation sobre events — sin $lookup porque emocion está embebida
  // Reemplaza: obtener_emocion_dominante_usuario (RPC Supabase)
  static async emocionDominante(id, dias = 365) {
    const { events } = getCollections();

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

    return events.aggregate(pipeline).toArray();
  }

  // TOP ARTISTAS
  // Aggregation sobre events — cancion_snapshot.nombre_artista embebido
  // Reemplaza: top_artistas_por_usuario (RPC Supabase)
  static async topArtistas(id, limit = 10) {
    const { events } = getCollections();

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

    return events.aggregate(pipeline).toArray();
  }
}

module.exports = User;