import { Card } from '@/components/ui/card';

export default function EvaluationMetrics({ summary }) {
  if (!summary) {
    return <div className="text-slate-400">Sin datos de evaluación</div>;
  }

  const metrics = summary.metricas_promedio || {};

  const MetricCard = ({ label, value, icon }) => (
    <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {value !== null && value !== undefined ? (value * 100).toFixed(1) : 'N/A'}%
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h2 className="text-xl font-bold text-white mb-6">Métricas Promedio</h2>

      <MetricCard
        label="Faithfulness"
        value={metrics.faithfulness}
        icon="📊"
      />
      <MetricCard
        label="Answer Relevancy"
        value={metrics.answer_relevancy}
        icon="🎯"
      />
      <MetricCard
        label="Context Recall"
        value={metrics.context_recall}
        icon="🔍"
      />

      <div className="border-t border-slate-700 pt-4 mt-4">
        <div className="text-sm text-slate-400">
          <p>
            <strong>Total Evaluaciones:</strong> {summary.total_evaluaciones || 0}
          </p>
          <p className="mt-2">
            <strong>Consultas Evaluadas:</strong> {summary.total_consultas_evaluadas || 0}
          </p>
          {summary.ultima_evaluacion && (
            <p className="mt-2 text-xs">
              <strong>Última evaluación:</strong>{' '}
              {new Date(summary.ultima_evaluacion).toLocaleString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
