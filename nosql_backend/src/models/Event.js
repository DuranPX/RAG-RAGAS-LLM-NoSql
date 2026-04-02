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

  static async registrar({
    id_usuario,
    id_cancion,
    nombre_emocion,
    descripcion_emocion = null,
    tipo_relacion = "reproducida"
  }) {
    const errores = validateEvento({ id_usuario, id_cancion, nombre_emocion, tipo_relacion });
    if (errores.length) throw { status: 400, errores };

    const { eventos, canciones, usuarios } = getCollections();

    const cancion = await canciones.findOne(
      { _id: new ObjectId(id_cancion) },
      {
        projection: {
          titulo: 1,
          "artista.nombre": 1,
          genero: 1,
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
        nombre_artista: cancion.artista?.nombre || null,
        nombre_genero: cancion.genero || null,
        duracion: cancion.duracion || null
      },
      emocion: {
        nombre: nombre_emocion,
        descripcion: descripcion_emocion
      },
      tipo_relacion,
      fecha_evento: new Date()
    };

    const result = await eventos.insertOne(doc);

    if (tipo_relacion === "reproducida" && cancion.duracion) {
      await usuarios.updateOne(
        { _id: new ObjectId(id_usuario) },
        { $inc: { tiempo_escucha: cancion.duracion / 60 } }
      );
    }

    return { _id: result.insertedId, ...doc };
  }

  static async findByUsuario(id_usuario, { limit = 50, dias = 30 } = {}) {
    const { eventos } = getCollections();

    return eventos
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

  static async emocionesPorCancion(id_cancion) {
    const { eventos } = getCollections();

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

    return eventos.aggregate(pipeline).toArray();
  }
}

module.exports = Event;