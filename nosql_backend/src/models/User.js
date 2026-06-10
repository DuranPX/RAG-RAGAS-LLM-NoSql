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
        nuevos_hoy: 0,
        crecimiento_mensual: [0, 0, 0, 0, 0, 0],
        escucha_por_plan: { free: 0, premium: 0, family: 0 },
        mensaje: "No hay metricas registradas"
      };
    }

    // ── Límites de fecha ───────────────────────────────────────────────────────
    const ahora = new Date();

    // Inicio del día actual (medianoche UTC)
    const inicioDia = new Date(ahora);
    inicioDia.setUTCHours(0, 0, 0, 0);

    // Inicio del mes hace 5 meses (para cubrir los últimos 6 meses contando el actual)
    const inicioVentana = new Date(ahora.getUTCFullYear(), ahora.getUTCMonth() - 5, 1);

    // ── Queries en paralelo ────────────────────────────────────────────────────
    const [statsBase, nuevosHoy, crecimientoRaw, escuchaRaw] = await Promise.all([

      // 1. Métricas base (igual que antes)
      usuarios.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            free_count:    { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "free"]    }, 1, 0] } },
            premium_count: { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "premium"] }, 1, 0] } },
            family_count:  { $sum: { $cond: [{ $eq: ["$plan_suscripcion", "family"]  }, 1, 0] } },
            total_tiempo:  { $sum: { $ifNull: ["$tiempo_escucha", 0] } },
            total_historial: { $sum: { $size: { $ifNull: ["$historial_reciente", []] } } }
          }
        },
        {
          $project: {
            _id: 0,
            total_usuarios: "$total",
            suscripciones: {
              free:    { $round: [{ $multiply: [{ $divide: ["$free_count",    "$total"] }, 100] }, 1] },
              premium: { $round: [{ $multiply: [{ $divide: ["$premium_count", "$total"] }, 100] }, 1] },
              family:  { $round: [{ $multiply: [{ $divide: ["$family_count",  "$total"] }, 100] }, 1] }
            },
            promedio_tiempo_escucha: { $round: [{ $divide: ["$total_tiempo",    "$total"] }, 1] },
            historial_promedio:      { $round: [{ $divide: ["$total_historial", "$total"] }, 1] }
          }
        }
      ]).toArray(),

      // 2. Usuarios registrados hoy
      usuarios.countDocuments({ fecha_registro: { $gte: inicioDia } }),

      // 3. Crecimiento mensual — últimos 6 meses
      usuarios.aggregate([
        { $match: { fecha_registro: { $gte: inicioVentana } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$fecha_registro" },
              month: { $month: "$fecha_registro" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]).toArray(),

      // 4. Promedio de tiempo de escucha agrupado por plan
      usuarios.aggregate([
        {
          $group: {
            _id: "$plan_suscripcion",
            promedio: { $avg: { $ifNull: ["$tiempo_escucha", 0] } }
          }
        }
      ]).toArray()
    ]);

    // ── Construir array de crecimiento mensual (6 posiciones, sin huecos) ──────
    // Genera los 6 meses que deben aparecer en orden
    const mesesEsperados = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(ahora.getUTCFullYear(), ahora.getUTCMonth() - 5 + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

    // Mapea los resultados reales sobre esos 6 slots (0 si no hubo registros)
    const crecimientoMensual = mesesEsperados.map(({ year, month }) => {
      const found = crecimientoRaw.find(
        (r) => r._id.year === year && r._id.month === month
      );
      return found ? found.count : 0;
    });

    // ── Construir objeto escucha_por_plan ──────────────────────────────────────
    const escuchaPorPlan = { free: 0, premium: 0, family: 0 };
    for (const row of escuchaRaw) {
      if (row._id in escuchaPorPlan) {
        escuchaPorPlan[row._id] = Math.round(row.promedio);
      }
    }

    return {
      ...statsBase[0],
      nuevos_hoy: nuevosHoy,
      crecimiento_mensual: crecimientoMensual,
      escucha_por_plan: escuchaPorPlan
    };
  }
}

module.exports = User;