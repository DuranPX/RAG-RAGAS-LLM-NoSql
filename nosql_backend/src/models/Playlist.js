const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validatePlaylist({ titulo, id_usuario }) {
  const errores = [];
  if (!titulo || typeof titulo !== "string") errores.push("titulo requerido");
  if (!id_usuario) errores.push("id_usuario requerido");
  return errores;
}

class Playlist {

  // FIND POR USUARIO
  // find directo — sin $lookup porque portada está embebida
  static async findByUsuario(id_usuario) {
    const { playlists } = getCollections();
    return playlists
      .find({ id_usuario: new ObjectId(id_usuario) })
      .sort({ fecha_creacion: -1 })
      .toArray();
  }

  // FIND BY ID
  static async findById(id) {
    const { playlists } = getCollections();
    return playlists.findOne({ _id: new ObjectId(id) });
  }

  // CREATE
  // portada embebida (URL iTunes) — sin referencia a colección portadas
  // porque playlists no participan en búsqueda vectorial de imágenes
  static async create({ titulo, descripcion = null, id_usuario, portada = null }) {
    const errores = validatePlaylist({ titulo, id_usuario });
    if (errores.length) throw { status: 400, errores };

    const { playlists } = getCollections();

    const doc = {
      titulo,
      descripcion,
      id_usuario: new ObjectId(id_usuario),
      portada,            
      canciones: [],      
      fecha_creacion: new Date(),
    };

    const result = await playlists.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  // AGREGAR CANCIÓN — patrón híbrido
  // Guarda ObjectId + campos clave desnormalizados (sin letra ni embedding)
  // Reemplaza: playlist_cancion (tabla N:M en Supabase)
  static async addCancion(id_playlist, id_cancion) {
    const { playlists, canciones } = getCollections();

    // Busca la canción para desnormalizar — solo campos de display
    // La letra y emb_letra NO se cargan aquí
    const cancion = await canciones.findOne(
      { _id: new ObjectId(id_cancion) },
      {
        projection: {
          titulo: 1,
          nombre_artista: 1,
          duracion: 1,
          "portada.url": 1
        }
      }
    );

    if (!cancion) throw { status: 404, errores: ["Canción no encontrada"] };

    // Snapshot híbrido: referencia + datos de display
    const snapshot = {
      id_cancion: new ObjectId(id_cancion),
      titulo: cancion.titulo,
      nombre_artista: cancion.nombre_artista,
      duracion: cancion.duracion || null,
      portada_url: cancion.portada?.url || null  
    };

    const result = await playlists.updateOne(
      { _id: new ObjectId(id_playlist) },
      { $addToSet: { canciones: snapshot } }
    );

    if (result.matchedCount === 0) throw { status: 404, errores: ["Playlist no encontrada"] };
    return snapshot;
  }

  // REMOVER CANCIÓN
  // $pull sobre el array embebido
  static async removeCancion(id_playlist, id_cancion) {
    const { playlists } = getCollections();

    const result = await playlists.updateOne(
      { _id: new ObjectId(id_playlist) },
      { $pull: { canciones: { id_cancion: new ObjectId(id_cancion) } } }
    );

    if (result.matchedCount === 0) throw { status: 404, errores: ["Playlist no encontrada"] };
    return { mensaje: "Canción removida" };
  }

  // TOP PLAYLISTS POR CANCIONES
  // $size sobre array embebido — sin $lookup
  // Reemplaza: top_playlists_usuario (RPC Supabase)
  static async topPorCanciones(id_usuario, limit = 10) {
    const { playlists } = getCollections();

    const pipeline = [
      { $match: { id_usuario: new ObjectId(id_usuario) } },
      {
        $project: {
          titulo: 1,
          descripcion: 1,
          "portada.url": 1,
          fecha_creacion: 1,
          n_canciones: { $size: { $ifNull: ["$canciones", []] } }
        }
      },
      { $sort: { n_canciones: -1 } },
      { $limit: limit }
    ];

    return playlists.aggregate(pipeline).toArray();
  }
}

module.exports = Playlist;