// Las rutas llaman directamente a los modelos
// La lógica de negocio vive en src/models/

const { Router } = require("express");
const router = Router();

const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Event    = require("../models/Event");
const Query    = require("../models/Query");
const Artist  = require("../models/Artist");
const Album   = require("../models/Album");
const { SongModel }  = require("../models/Song");
const { ChunkModel } = require("../models/Chunk");

// Helper de errores
const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req, res);
    if (data !== undefined) res.json(data);
  } catch (err) {
    const status = err.status || 500;
    const mensaje = err.errores || [err.message || "Error interno"];
    res.status(status).json({ errores: mensaje });
  }
};

// USUARIOS
router.get("/usuarios", handle(async () => {
  return User.findAll();
}));

router.get("/usuarios/:id", handle(async (req) => {
  const user = await User.findById(req.params.id);
  if (!user) throw { status: 404, errores: ["Usuario no encontrado"] };
  return user;
}));

router.post("/usuarios", handle(async (req) => {
  return User.create(req.body);
}));

router.patch("/usuarios/:id/tiempo-escucha", handle(async (req) => {
  return User.incrementarTiempo(req.params.id, req.body.minutos);
}));

router.get("/usuarios/:id/emociones-dominantes", handle(async (req) => {
  const dias = parseInt(req.query.dias) || 365;
  return User.emocionDominante(req.params.id, dias);
}));

router.get("/usuarios/:id/top-artistas", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  return User.topArtistas(req.params.id, limit);
}));

// PLAYLISTS
router.get("/playlists/usuario/:id_usuario/top", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  return Playlist.topPorCanciones(req.params.id_usuario, limit);
}));

router.get("/playlists/usuario/:id_usuario", handle(async (req) => {
  return Playlist.findByUsuario(req.params.id_usuario);
}));

router.get("/playlists/:id", handle(async (req) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) throw { status: 404, errores: ["Playlist no encontrada"] };
  return playlist;
}));

router.post("/playlists", handle(async (req) => {
  return Playlist.create(req.body);
}));

router.post("/playlists/:id/canciones", handle(async (req) => {
  const snapshot = await Playlist.addCancion(req.params.id, req.body.id_cancion);
  return { mensaje: "Canción agregada", snapshot };
}));

router.delete("/playlists/:id/canciones/:id_cancion", handle(async (req) => {
  return Playlist.removeCancion(req.params.id, req.params.id_cancion);
}));

// EVENTS
router.post("/events", handle(async (req) => {
  return Event.registrar(req.body);
}));

router.get("/events/usuario/:id_usuario", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 50;
  const dias = parseInt(req.query.dias) || 30;
  return Event.findByUsuario(req.params.id_usuario, { limit, dias });
}));

router.get("/events/cancion/:id_cancion/emociones", handle(async (req) => {
  return Event.emocionesPorCancion(req.params.id_cancion);
}));

// QUERIES
router.get("/queries/usuario/:id_usuario", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 50;
  return Query.historialPorUsuario(req.params.id_usuario, limit);
}));

router.post("/queries", handle(async (req) => {
  return Query.create(req.body);
}));

router.patch("/queries/:id/respuesta-llm", handle(async (req) => {
  return Query.guardarRespuesta(req.params.id, req.body);
}));

router.get("/queries/:id", handle(async (req) => {
  const query = await Query.findById(req.params.id);
  if (!query) throw { status: 404, errores: ["Consulta no encontrada"] };
  return query;
}));

// HEALTH
router.get("/health", (_, res) => res.json({ status: "ok" }));

// ARTISTS
router.get("/artists", handle(async () => {
  return Artist.findAll();
}));

router.get("/artists/:id", handle(async (req) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) throw { status: 404, errores: ["Artist no encontrado"] };
  return artist;
}));

router.post("/artists", handle(async (req) => {
  return Artist.create(req.body);
}));

router.put("/artists/:id", handle(async (req) => {
  return Artist.update(req.params.id, req.body);
}));

router.delete("/artists/:id", handle(async (req) => {
  return Artist.delete(req.params.id);
}));

// ALBUMS
router.get("/albums", handle(async () => {
  return Album.findAll();
}));

router.get("/albums/:id", handle(async (req) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw { status: 404, errores: ["Album no encontrado"] };
  return album;
}));

router.post("/albums", handle(async (req) => {
  return Album.create(req.body);
}));

router.put("/albums/:id", handle(async (req) => {
  return Album.update(req.params.id, req.body);
}));

router.delete("/albums/:id", handle(async (req) => {
  return Album.delete(req.params.id);
}));

// CANCIONES
router.get("/canciones", handle(async () => {
  return SongModel.find({}, { projection: { emb_letra: 0, letra: 0 } });
}));

router.get("/canciones/:id", handle(async (req) => {
  const song = await SongModel.findById(req.params.id);
  if (!song) throw { status: 404, errores: ["Canción no encontrada"] };
  return song;
}));

router.post("/canciones", handle(async (req) => {
  return SongModel.insertOne(req.body);
}));

router.put("/canciones/:id", handle(async (req) => {
  const result = await SongModel.updateById(req.params.id, req.body);
  if (result.matchedCount === 0) throw { status: 404, errores: ["Canción no encontrada"] };
  return result;
}));

router.delete("/canciones/:id", handle(async (req) => {
  const result = await SongModel.deleteById(req.params.id);
  if (result.deletedCount === 0) throw { status: 404, errores: ["Canción no encontrada"] };
  return { message: "Canción eliminada" };
}));

router.post("/canciones/vector-search", handle(async (req) => {
  const { queryVector, limit = 5 } = req.body;
  if (!queryVector) throw { status: 400, errores: ["queryVector requerido"] };
  return SongModel.vectorSearch(queryVector, limit);
}));

// CHUNKS
router.get("/chunks/documento/:doc_id", handle(async (req) => {
  return ChunkModel.findByDocId(req.params.doc_id);
}));

router.get("/chunks/estrategia/:estrategia", handle(async (req) => {
  return ChunkModel.findByEstrategia(req.params.estrategia);
}));

router.post("/chunks/vector-search", handle(async (req) => {
  const { queryVector, limit = 5 } = req.body;
  if (!queryVector) throw { status: 400, errores: ["queryVector requerido"] };
  return ChunkModel.vectorSearch(queryVector, limit);
}));

// SEARCH
router.post("/search", handle(async (req) => {
  const { texto, anio, pais, genero } = req.body;
  const { albums, artists } = require("../config/db").getCollections();

  // --- Filtro de artistas (igual que antes) ---
  let artistFilter = {};
  if (pais)   artistFilter.pais = pais;
  if (genero) artistFilter.generos = { $regex: genero, $options: "i" };
  if (texto)  artistFilter.nombre  = { $regex: texto,  $options: "i" };

  const artistsRes = await artists.find(artistFilter).toArray();
  const artistIds  = artistsRes.map(a => a._id);

  // --- Filtro de albums (igual que antes) ---
  let albumFilter = {};
  if (anio)  albumFilter.anio   = Number(anio);
  if (texto) albumFilter.titulo = { $regex: texto, $options: "i" };
  if (artistIds.length > 0) albumFilter.id_artista = { $in: artistIds };

  const albumsRes = await albums.find(albumFilter).toArray();
  const albumIds  = albumsRes.map(a => a._id);

  const artistIdsFromAlbums = albumsRes.map(a => a.id_artista);
  const extraArtists = await artists.find({
    _id: { $in: artistIdsFromAlbums }
  }).toArray();

  const allArtists = [
    ...artistsRes,
    ...extraArtists.filter(a =>
      !artistsRes.some(a2 => a2._id.toString() === a._id.toString())
    )
  ];

  // --- 👇 NUEVO: buscar canciones usando los IDs encontrados ---
  let songFilter = {};
  if (genero) songFilter.genero = { $regex: genero, $options: "i" };
  if (texto)  songFilter.titulo = { $regex: texto,  $options: "i" };

  // Filtrar por album (que ya trae el filtro de año y artista aplicado)
  if (albumIds.length > 0) {
    songFilter["album.id_album"] = { $in: albumIds };
  } else if (anio || artistIds.length > 0) {
    // Si había filtros pero no se encontraron albums/artistas, no devolver nada
    return { albums: albumsRes, artists: allArtists, canciones: [], total: 0, rag: null };
  }

  const canciones = await SongModel.find(songFilter, {
    projection: { emb_letra: 0, letra: 0 } // no mandar los vectores al frontend
  });

  return {
    albums: albumsRes,
    artists: allArtists,
    canciones,
    total: canciones.length,
    rag: null // aquí se conecta el pipeline RAG
  };
}));

module.exports = router;