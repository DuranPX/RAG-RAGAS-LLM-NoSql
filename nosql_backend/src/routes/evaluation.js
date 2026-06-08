const { Router } = require('express');
const evaluationController = require('../controllers/evaluation.controller');

const router = Router();

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req, res);
    if (data !== undefined) res.json(data);
  } catch (err) {
    const status = err.status || 500;
    const mensaje = err.errores || [err.message || 'Error interno'];
    res.status(status).json({ errores: mensaje });
  }
};

/**
 * POST /evaluation/run
 * Inicia una evaluación completa del sistema RAG
 */
router.post('/run', handle(async (req, res) => {
  return evaluationController.ejecutarEvaluacion();
}));

/**
 * GET /evaluation/results
 * Obtiene los resultados históricos de las evaluaciones
 */
router.get('/results', handle(async (req, res) => {
  return evaluationController.obtenerResultadosHistoricos();
}));

/**
 * GET /evaluation/results/:id
 * Obtiene los detalles de una evaluación específica
 */
router.get('/results/:id', handle(async (req, res) => {
  return evaluationController.obtenerDetallesEvaluacion(req.params.id);
}));

/**
 * GET /evaluation/summary
 * Obtiene un resumen estadístico de todas las evaluaciones
 */
router.get('/summary', handle(async (req, res) => {
  return evaluationController.obtenerResumenEvaluaciones();
}));

module.exports = router;
