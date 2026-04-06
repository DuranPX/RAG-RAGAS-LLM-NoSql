const { getCollections } = require("../config/db");
const { ObjectId } = require("mongodb");

function validateArtist({ nombre }) {
  const errores = [];
  if (!nombre || typeof nombre !== "string") {
    errores.push("nombre requerido");
  }
  return errores;
}

class Artist {

  static async findAll() {
    const { artistas } = getCollections();
    return artistas.find().toArray();
  }

  static async findById(id) {
    const { artistas } = getCollections();
    return artistas.findOne({ _id: new ObjectId(id) });
  }

  static async create({
    nombre,
    pais = null,
    descripcion = null,
    generos = [],
    idioma = null
  }) {
    const errores = validateArtist({ nombre });
    if (errores.length) throw { status: 400, errores };

    const { artistas } = getCollections();

    const doc = {
      nombre,
      pais,
      descripcion,
      generos,
      emb_descripcion: null,
      fecha: new Date(),
      idioma
    };

    const result = await artistas.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  static async update(id, data) {
    const { artistas } = getCollections();

    const result = await artistas.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );

    if (!result) throw { status: 404, errores: ["Artist no encontrado"] };
    return result;
  }

  static async delete(id) {
    const { artistas } = getCollections();

    const result = await artistas.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw { status: 404, errores: ["Artist no encontrado"] };
    }

    return { message: "Artist eliminado" };
  }
}

module.exports = Artist;