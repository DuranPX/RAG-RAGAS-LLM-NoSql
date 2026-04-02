const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validateAlbum({ titulo, id_artista }) {
  const errores = [];
  if (!titulo || typeof titulo !== "string") errores.push("titulo requerido");
  if (!id_artista) errores.push("id_artista requerido");
  return errores;
}

class Album {

  static async findAll() {
    const { albums } = getCollections();
    return albums.find().toArray();
  }

  static async findById(id) {
    const { albums } = getCollections();
    return albums.findOne({ _id: new ObjectId(id) });
  }

  static async create({ titulo, anio, id_artista, portada = null, idioma = "es" }) {
    if (!titulo) throw { status: 400, errores: ["titulo requerido"] };
    if (!id_artista) throw { status: 400, errores: ["id_artista requerido"] };

    const { albums, artistas } = getCollections();

    let artista;
    try {
      artista = await artistas.findOne({ _id: new ObjectId(id_artista) });
    } catch {
      throw { status: 400, errores: ["id_artista inválido"] };
    }

    if (!artista) {
      throw { status: 404, errores: ["El artista no existe"] };
    }

    const doc = {
      titulo,
      anio: anio ? Number(anio) : null,
      id_artista: new ObjectId(id_artista),
      portada,
      fecha: new Date(),
      idioma
    };

    const result = await albums.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  static async update(id, data) {
    const { albums } = getCollections();

    if (data.id_artista) {
      data.id_artista = new ObjectId(data.id_artista);
    }

    const result = await albums.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );

    if (!result) throw { status: 404, errores: ["Album no encontrado"] };
    return result;
  }

  static async delete(id) {
    const { albums } = getCollections();

    const result = await albums.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw { status: 404, errores: ["Album no encontrado"] };
    }

    return { message: "Album eliminado" };
  }
}

module.exports = Album;