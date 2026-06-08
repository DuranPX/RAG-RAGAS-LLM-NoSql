import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { evaluationService } from '@/api/services/evaluationService';

export default function EvaluationRunner({ onRunEvaluation, executing, totalEvaluations }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Ejecutar Evaluación</h2>

      <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-700">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white mb-2">
            Acerca de esta evaluación
          </h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>✓ Ejecuta 20 preguntas de prueba sobre el sistema RAG</li>
            <li>✓ Calcula métricas RAGAS (Faithfulness, Answer Relevancy, Context Recall)</li>
            <li>✓ Utiliza el mismo pipeline del backend (Meta-Llama-3-8B-Instruct)</li>
            <li>✓ Almacena resultados para comparativas futuras</li>
          </ul>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-200">
            ⏱️ Tiempo estimado: 2-5 minutos según disponibilidad de recursos
          </p>
        </div>
      </div>

      <Button
        onClick={onRunEvaluation}
        disabled={executing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {executing ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⚙️</span>
            Ejecutando evaluación...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">▶️</span>
            Ejecutar Evaluación RAGAS
          </span>
        )}
      </Button>

      {showDetails && (
        <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-slate-700 text-xs text-slate-300">
          <p className="mb-2">
            <strong>Dataset:</strong> 20 pares (pregunta, respuesta esperada) curadas del dominio musical
          </p>
          <p className="mb-2">
            <strong>Modelo:</strong> meta-llama/Meta-Llama-3-8B-Instruct (via HuggingFace)
          </p>
          <p className="mb-2">
            <strong>Embedding:</strong> all-MiniLM-L6-v2 (text) + CLIP-ViT-B-32 (imagen)
          </p>
          <p>
            <strong>Métricas RAGAS:</strong> Faithfulness (respuesta fiel a contexto), Answer Relevancy (relevancia de respuesta), Context Recall (recuperación de contextos)
          </p>
        </div>
      )}

      {totalEvaluations > 0 && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
          <p className="text-sm text-green-200">
            ✓ Hay {totalEvaluations} evaluación(es) anterior(es). Los resultados se compararan automáticamente.
          </p>
        </div>
      )}
    </Card>
  );
}
