// Un evento = usuario escucha canción y experimenta emoción
// Todo embebido: cancion_snapshot (parcial) + emocion completa

const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

const TIPOS_RELACION = ["favorita", "reproducida", "buscada"];

function validateEvento({ id_usuario, id_cancion, nombre_emocion, tipo_relacion }) {
  const errores = [];
  if (!id_usuario) errores.push("id_usuario requerido");
  if (!id_cancion) errores.push("id_cancion requerido");
  if (!nombre_emocion || typeof nombre_emocion !== "string") errores.push("nombre_emocion requerido");
  if (!TIPOS_RELACION.includes(tipo_relacion)) {
    errores.push(`tipo_relacion debe ser: ${TIPOS_RELACION.join(", ")}`);
  }
  return errores;
}

class Event {

  // REGISTRAR EVENTO
  // cancion_snapshot: desnormalización parcial
  //   → sin letra ni emb_letra (esos viven en colección canciones)
  //   → con titulo, nombre_artista, nombre_genero, duracion
  // emocion: totalmente embebida
  //
  // Si tipo_relacion = "reproducida" → $inc tiempo_escucha en usuario
  // Reemplaza: registrar_emocion_usuario_atomico (RPC Supabase)
  static async registrar({
    id_usuario,
    id_cancion,
    nombre_emocion,
    descripcion_emocion = null,
    tipo_relacion = "reproducida"
  }) {
    const errores = validateEvento({ id_usuario, id_cancion, nombre_emocion, tipo_relacion });
    if (errores.length) throw { status: 400, errores };

    const { events, canciones, usuarios } = getCollections();

    // Solo campos analíticos — letra y emb_letra NO se cargan
    const cancion = await canciones.findOne(
      { _id: new ObjectId(id_cancion) },
      {
        projection: {
          titulo: 1,
          nombre_artista: 1,
          nombre_genero: 1,
          duracion: 1
        }
      }
    );

    if (!cancion) throw { status: 404, errores: ["Canción no encontrada"] };

    const doc = {
      id_usuario: new ObjectId(id_usuario),
      cancion_snapshot: {
        id_cancion: new ObjectId(id_cancion),
        titulo: cancion.titulo,
        nombre_artista: cancion.nombre_artista,
        nombre_genero: cancion.nombre_genero || null,
        duracion: cancion.duracion || null
      },
      emocion: {
        nombre: nombre_emocion,
        descripcion: descripcion_emocion
      },
      tipo_relacion,
      fecha_evento: new Date()
    };

    const result = await events.insertOne(doc);

    if (tipo_relacion === "reproducida" && cancion.duracion) {
      await usuarios.updateOne(
        { _id: new ObjectId(id_usuario) },
        { $inc: { tiempo_escucha: cancion.duracion / 60 } }
      );
    }

    return { _id: result.insertedId, ...doc };
  }

  // EVENTOS POR USUARIO — con filtro temporal opcional
  // find directo
  static async findByUsuario(id_usuario, { limit = 50, dias = 30 } = {}) {
    const { events } = getCollections();

    return events
      .find({
        id_usuario: new ObjectId(id_usuario),
        fecha_evento: {
          $gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
        }
      })
      .sort({ fecha_evento: -1 })
      .limit(limit)
      .toArray();
  }

  // EMOCIONES POR CANCIÓN
  // Aggregation sobre events — emocion.nombre embebido
  // Reemplaza: obtener_emociones_por_artista_rpc (RPC Supabase)
  static async emocionesPorCancion(id_cancion) {
    const { events } = getCollections();

    const pipeline = [
      {
        $match: {
          "cancion_snapshot.id_cancion": new ObjectId(id_cancion)
        }
      },
      {
        $group: {
          _id: "$emocion.nombre",
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          nombre_emocion: "$_id",
          total: 1
        }
      }
    ];

    return events.aggregate(pipeline).toArray();
  }
}

module.exports = Event;