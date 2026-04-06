// ================================================================
// RAGResponse.jsx — Muestra la respuesta generada por el LLM
// Recibe la respuesta RAG del backend y la renderiza
// ================================================================

'use client';

import React from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const RAGResponse = ({ response, isLoading, error }) => {
  // Estado: cargando
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-6 flex items-center gap-4">
        <Loader2 className="h-5 w-5 text-purple-400 animate-spin shrink-0" />
        <p className="text-white/60 text-sm">Generando respuesta con IA...</p>
      </div>
    );
  }

  // Estado: error
  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex items-center gap-4">
        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  // Estado: sin respuesta
  if (!response) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <h3 className="text-white font-semibold text-sm">Respuesta RAG</h3>
        <span className="ml-auto text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
          Llama 3.1 via Groq
        </span>
      </div>

      {/* Respuesta del LLM */}
      <p className="text-white/80 text-sm leading-relaxed">{response.respuesta}</p>

      {/* Canciones fuente usadas como contexto */}
      {response.canciones_contexto?.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-xs text-white/40 font-medium">Canciones usadas como contexto:</p>
          <div className="flex flex-wrap gap-2">
            {response.canciones_contexto.map((c, i) => (
              <span
                key={i}
                className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full"
              >
                {c.titulo} — {c.artista}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score de similitud promedio */}
      {response.score_promedio && (
        <p className="text-[10px] text-white/30">
          Score de similitud promedio: {(response.score_promedio * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
};

export default RAGResponse;