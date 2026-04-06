const { Router } = require("express");
const ragController = require("../controllers/rag.controller");
const router = Router();

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

// Text-to-Text 
router.post("/texto-texto", handle(ragController.textoTexto));

// Image-to-Text
router.post("/imagen-texto", handle(ragController.imagenTexto));

// Text-to-Image
router.post("/texto-imagen", handle(async (req) => {
  const { prompt } = req.body;
  // TODO: Generación de imagen no soportada todavía sin API
  return { mensaje: "Búsqueda Texto-Imagen (Mock)", prompt, url: "placeholder" };
}));

// Hybrid Search
router.post("/hibrido", handle(ragController.hibrido));

module.exports = router;
