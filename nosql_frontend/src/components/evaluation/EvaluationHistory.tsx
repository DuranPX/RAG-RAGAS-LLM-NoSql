import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { evaluationService } from '@/api/services/evaluationService';

export default function EvaluationHistory({ results, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [details, setDetails] = useState({});

  const handleExpandEvaluation = async (evaluationId) => {
    if (expandedId === evaluationId) {
      setExpandedId(null);
      return;
    }

    if (details[evaluationId]) {
      setExpandedId(evaluationId);
      return;
    }

    try {
      setLoadingDetails((prev) => ({ ...prev, [evaluationId]: true }));
      const data = await evaluationService.getEvaluationDetails(evaluationId);
      setDetails((prev) => ({ ...prev, [evaluationId]: data }));
      setExpandedId(evaluationId);
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [evaluationId]: false }));
    }
  };

  if (!results || results.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Historial de Evaluaciones</h2>
        <div className="text-center py-8 text-slate-400">
          <p>No hay evaluaciones disponibles aún.</p>
          <p className="text-sm mt-2">Ejecuta una evaluación para ver los resultados aquí.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Historial de Evaluaciones</h2>
        <Button
          onClick={onRefresh}
          className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1"
        >
          🔄 Actualizar
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result._id}
            className="border border-slate-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => handleExpandEvaluation(result._id)}
              className="w-full text-left bg-slate-700 hover:bg-slate-600 transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">
                      {result.metricas ? '✓' : '⚠️'}
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {new Date(result.fecha_evaluacion).toLocaleString('es-ES')}
                      </p>
                      <p className="text-sm text-slate-400">
                        {result.total_consultas} consultas | {result.modelo_evaluado}
                      </p>
                    </div>
                  </div>
                </div>

                {result.metricas && (
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-400">Faithfulness</p>
                      <p className="font-bold text-green-400">
                        {(result.metricas.faithfulness * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Answer Rel.</p>
                      <p className="font-bold text-blue-400">
                        {(result.metricas.answer_relevancy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Context Recall</p>
                      <p className="font-bold text-purple-400">
                        {(result.metricas.context_recall * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                <span className="ml-4 text-xl text-slate-400">
                  {expandedId === result._id ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {expandedId === result._id && (
              <div className="bg-slate-900 p-4 border-t border-slate-700">
                {loadingDetails[result._id] ? (
                  <div className="text-center text-slate-400">Cargando detalles...</div>
                ) : details[result._id] ? (
                  <div>
                    {result.error ? (
                      <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                        <p className="text-red-200 text-sm">
                          Error: {result.error}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-white mb-3">
                          Detalles de Consultas ({details[result._id].consultas.length})
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {details[result._id].consultas.map((query, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800 rounded p-3 text-sm border border-slate-700"
                            >
                              <p className="text-blue-300 font-mono mb-1">
                                P: {query.question}
                              </p>
                              <p className="text-green-300 font-mono mb-1">
                                R: {query.answer}
                              </p>
                              <p className="text-slate-400 text-xs">
                                Verdad: {query.ground_truth}
                              </p>
                              {query.contexts.length > 0 && (
                                <div className="mt-2 pl-2 border-l border-slate-600 text-slate-500">
                                  <p className="text-xs font-semibold mb-1">Contextos:</p>
                                  {query.contexts.map((ctx, cidx) => (
                                    <p key={cidx} className="text-xs truncate">
                                      • {ctx}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
