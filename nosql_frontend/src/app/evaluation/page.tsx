'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { evaluationService } from '@/api/services/evaluationService';
import EvaluationMetrics from '@/components/evaluation/EvaluationMetrics';
import EvaluationHistory from '@/components/evaluation/EvaluationHistory';
import EvaluationRunner from '@/components/evaluation/EvaluationRunner';
import AppShell from '@/components/layout/AppShell';

export default function EvaluationPage() {
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    console.log('EvaluationPage montada');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, resultsData] = await Promise.all([
        evaluationService.getSummary(),
        evaluationService.getResults()
      ]);

      setSummary(summaryData.resumen);
      setResults(resultsData.evaluaciones);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.errores?.[0] || 'Error cargando datos de evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setExecuting(true);
      setError(null);

      await evaluationService.runEvaluation();

      // Esperar un momento y recargar datos
      setTimeout(() => {
        loadData();
        setExecuting(false);
      }, 2000);
    } catch (err) {
      console.error('Error ejecutando evaluación:', err);
      setError(err.errores?.[0] || 'Error ejecutando evaluación');
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Evaluación RAGAS
          </h1>
          <p className="text-slate-400">
            Sistema de evaluación automática del pipeline RAG de SpotifyRAG
          </p>
        </div>

        {/* Error State */}
        {error && <ErrorState message={error} />}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Resumen Izquierdo */}
          <div className="lg:col-span-1">
            <EvaluationMetrics summary={summary} />
          </div>

          {/* Runner Centro-Derecho */}
          <div className="lg:col-span-2">
            <EvaluationRunner
              onRunEvaluation={handleRunEvaluation}
              executing={executing}
              totalEvaluations={summary?.total_evaluaciones || 0}
            />
          </div>
        </div>

        {/* Historial */}
        <div>
          <EvaluationHistory
            results={results}
            onRefresh={loadData}
          />
        </div>
      </div>
    </AppShell>
  );
}
