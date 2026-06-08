const { spawn } = require('child_process');
const path = require('path');
const { getDB } = require('../config/db');

/**
 * Ejecuta el script de evaluación RAGAS en el microservicio Python
 */
async function ejecutarEvaluacion() {
  try {
    console.log('Iniciando evaluación RAGAS...');

    const pythonScriptPath = path.join(
      __dirname,
      '../../python_service/scripts/evaluate_rag.py'
    );

    return new Promise((resolve, reject) => {
      // Ejecutar el script Python
      const pythonProcess = spawn('python', [pythonScriptPath]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`[PYTHON] ${data.toString().trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`[PYTHON ERROR] ${data.toString().trim()}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('[EVALUATION] Script completado exitosamente');
          resolve({
            status: 'success',
            mensaje: 'Evaluación completada exitosamente',
            exit_code: code
          });
        } else {
          console.error(`Script falló con código ${code}`);
          reject(new Error(`Script falló con código ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('[EVALUATION] Error ejecutando Python:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('[EVALUATION] Error:', error.message);
    throw {
      status: 500,
      errores: [`Error ejecutando evaluación: ${error.message}`]
    };
  }
}

/**
 * Obtiene los resultados históricos de evaluaciones
 */
async function obtenerResultadosHistoricos() {
  try {
    console.log('Obteniendo resultados históricos...');

    const db = getDB();
    const evaluaciones = db.collection('evaluaciones_ragas');

    // Obtener las últimas 10 evaluaciones ordenadas por fecha descendente
    const resultados = await evaluaciones
      .find({})
      .sort({ fecha_evaluacion: -1 })
      .limit(10)
      .toArray();

    console.log(`[EVALUATION] Se encontraron ${resultados.length} evaluaciones`);

    // Formatear resultados para la respuesta
    const formateados = resultados.map((doc) => ({
      _id: doc._id.toString(),
      fecha_evaluacion: doc.fecha_evaluacion,
      modelo_evaluado: doc.modelo_evaluado,
      total_consultas: doc.total_consultas,
      metricas: doc.metricas || {
        faithfulness: null,
        answer_relevancy: null,
        context_precision: null,
        context_recall: null
      },
      error: doc.error || null
    }));

    return {
      status: 'success',
      total_evaluaciones: formateados.length,
      evaluaciones: formateados
    };
  } catch (error) {
    console.error('[EVALUATION] Error obteniendo resultados:', error.message);
    throw {
      status: 500,
      errores: [`Error obteniendo resultados: ${error.message}`]
    };
  }
}

/**
 * Obtiene los detalles de una evaluación específica
 */
async function obtenerDetallesEvaluacion(id_evaluacion) {
  try {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id_evaluacion)) {
      throw {
        status: 400,
        errores: ['ID de evaluación inválido']
      };
    }

    const db = getDB();
    const evaluaciones = db.collection('evaluaciones_ragas');
    const consultas = db.collection('consultas_evaluacion');

    // Obtener la evaluación
    const evaluacion = await evaluaciones.findOne({
      _id: new ObjectId(id_evaluacion)
    });

    if (!evaluacion) {
      throw {
        status: 404,
        errores: ['Evaluación no encontrada']
      };
    }

    // Obtener las consultas asociadas
    const consultasDetalles = await consultas
      .find({ id_evaluacion: new ObjectId(id_evaluacion) })
      .sort({ indice: 1 })
      .toArray();

    return {
      status: 'success',
      evaluacion: {
        _id: evaluacion._id.toString(),
        fecha_evaluacion: evaluacion.fecha_evaluacion,
        modelo_evaluado: evaluacion.modelo_evaluado,
        total_consultas: evaluacion.total_consultas,
        metricas: evaluacion.metricas
      },
      consultas: consultasDetalles.map((c) => ({
        indice: c.indice,
        question: c.question,
        ground_truth: c.ground_truth,
        answer: c.answer,
        contexts: c.contexts,
        fecha: c.fecha
      }))
    };
  } catch (error) {
    if (error.status) throw error;
    console.error('[EVALUATION] Error obteniendo detalles:', error.message);
    throw {
      status: 500,
      errores: [`Error obteniendo detalles: ${error.message}`]
    };
  }
}

/**
 * Obtiene un resumen estadístico de todas las evaluaciones
 */
/**
 * Obtiene un resumen estadístico de todas las evaluaciones
 */
async function obtenerResumenEvaluaciones() {
  try {
    console.log('[EVALUATION] Calculando resumen de evaluaciones...');

    const db = getDB();
    const evaluaciones = db.collection('evaluaciones_ragas');

    const stats = await evaluaciones.aggregate([
      {
        $match: {
          metricas: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,

          total_evaluaciones: {
            $sum: 1
          },

          total_consultas: {
            $sum: '$total_consultas'
          },

          ultima_evaluacion: {
            $max: '$fecha_evaluacion'
          },

          answer_relevancy_promedio: {
            $avg: '$metricas.answer_relevancy'
          },

          retrieval_hit_rate_promedio: {
            $avg: '$metricas.retrieval_hit_rate'
          },

          retrieval_mrr_promedio: {
            $avg: '$metricas.retrieval_mrr'
          },

          retrieval_precision_at_k_promedio: {
            $avg: '$metricas.retrieval_precision_at_k'
          },

          retrieval_recall_at_k_promedio: {
            $avg: '$metricas.retrieval_recall_at_k'
          }
        }
      }
    ]).toArray();

    const resumen = stats.length > 0
      ? stats[0]
      : {
          total_evaluaciones: 0,
          total_consultas: 0,
          ultima_evaluacion: null,

          answer_relevancy_promedio: 0,
          retrieval_hit_rate_promedio: 0,
          retrieval_mrr_promedio: 0,
          retrieval_precision_at_k_promedio: 0,
          retrieval_recall_at_k_promedio: 0
        };

    return {
      status: 'success',
      resumen: {
        total_evaluaciones: resumen.total_evaluaciones,

        metricas_promedio: {
          answer_relevancy: Number(
            (resumen.answer_relevancy_promedio || 0).toFixed(4)
          ),

          retrieval_hit_rate: Number(
            (resumen.retrieval_hit_rate_promedio || 0).toFixed(4)
          ),

          retrieval_mrr: Number(
            (resumen.retrieval_mrr_promedio || 0).toFixed(4)
          ),

          retrieval_precision_at_k: Number(
            (resumen.retrieval_precision_at_k_promedio || 0).toFixed(4)
          ),

          retrieval_recall_at_k: Number(
            (resumen.retrieval_recall_at_k_promedio || 0).toFixed(4)
          )
        },

        total_consultas_evaluadas: resumen.total_consultas,
        ultima_evaluacion: resumen.ultima_evaluacion
      }
    };
  } catch (error) {
    console.error(
      '[EVALUATION] Error calculando resumen:',
      error.message
    );

    throw {
      status: 500,
      errores: [
        `Error calculando resumen: ${error.message}`
      ]
    };
  }
}

module.exports = {
  ejecutarEvaluacion,
  obtenerResultadosHistoricos,
  obtenerDetallesEvaluacion,
  obtenerResumenEvaluaciones
};
