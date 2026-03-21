// Las rutas llaman directamente a los modelos
// La lógica de negocio vive en src/models/

const { Router } = require("express");
const router = Router();

const User     = require("../models/User");
const Playlist = require("../models/Playlist");
const Event    = require("../models/Event");
const Query    = require("../models/Query");
const Artist  = require("../models/Artist");
const Album   = require("../models/Album");

// Helper uniforme de errores - hook
const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req, res);
    if (data !== undefined) res.json(data);
  } catch (err) {
    const status  = err.status  || 500;
    const mensaje = err.errores || [err.message || "Error interno"];
    res.status(status).json({ errores: mensaje });
  }
};


// USUARIOS
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

// Aggregation 2
router.get("/usuarios/:id/emociones-dominantes", handle(async (req) => {
  const dias = parseInt(req.query.dias) || 365;
  return User.emocionDominante(req.params.id, dias);
}));

router.get("/usuarios/:id/top-artistas", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  return User.topArtistas(req.params.id, limit);
}));

// PLAYLISTS

// Ruta /top ANTES de /:id para que Express no la confunda
router.get("/playlists/usuario/:id_usuario/top", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  return Playlist.topPorCanciones(req.params.id_usuario, limit);  // Aggregation 3
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

// ===========================================================
// EVENTS
// ===========================================================
router.post("/events", handle(async (req) => {
  return Event.registrar(req.body);
}));

router.get("/events/usuario/:id_usuario", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 50;
  const dias  = parseInt(req.query.dias)  || 30;
  return Event.findByUsuario(req.params.id_usuario, { limit, dias });
}));

router.get("/events/cancion/:id_cancion/emociones", handle(async (req) => {
  return Event.emocionesPorCancion(req.params.id_cancion);
}));

// ===========================================================
// QUERIES
// ===========================================================

// Ruta /usuario/:id ANTES de /:id
router.get("/queries/usuario/:id_usuario", handle(async (req) => {
  const limit = parseInt(req.query.limit) || 50;
  return Query.historialPorUsuario(req.params.id_usuario, limit);  // Aggregation 1
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

// ===========================================================
// HEALTH
// ===========================================================
router.get("/health", (_, res) => res.json({ status: "ok" }));

// ===========================================================
// ARTISTS
// ===========================================================

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

// ===========================================================
// ALBUMS
// ===========================================================

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

// ===========================================================
// SEARCH
// ===========================================================
router.post("/search", handle(async (req) => {

  const { texto, anio, pais, genero } = req.body;
  const { albums, artists } = require("../config/db").getCollections();

  let artistFilter = {};
  let albumFilter  = {};

  // FILTRO DE ARTISTAS
  if (pais) artistFilter.pais = pais;

  if (genero) {
    artistFilter.generos = { $regex: genero, $options: "i" };
  }

  if (texto) {
    artistFilter.nombre = { $regex: texto, $options: "i" };
  }

  // 1. BUSCAR ARTISTAS PRIMERO
  const artistsRes = await artists.find(artistFilter).toArray();
  const artistIds = artistsRes.map(a => a._id);

  // FILTRO DE ÁLBUMES
  if (anio) {
    albumFilter.anio = Number(anio);
  }

  if (texto) {
    albumFilter.titulo = { $regex: texto, $options: "i" };
  }

  // 2. RELACIÓN: ÁLBUMES DE ESOS ARTISTAS
  if (artistIds.length > 0) {
    albumFilter.id_artista = { $in: artistIds };
  }

  const albumsRes = await albums.find(albumFilter).toArray();
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

  return {
    albums: albumsRes,
    artists: allArtists
  };
}));

module.exports = router;