// ================================================================
// /search — Página de búsqueda conectada al backend RAG
// Recibe el query por URL params y muestra resultados + respuesta
// ================================================================

'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import RAGResponse from '@/shared/components/cards/RAGResponse';
import SongCard from '@/components/cards/SongCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useSearch } from '@/shared/hooks/useSearch';
import { Search } from 'lucide-react';
import Link from 'next/link';
import SearchFilters from '@/components/ui/SearchFilters';

// Formatea segundos a mm:ss
const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || undefined;
  const yearParam  = searchParams.get('year')  || undefined;
  const { results, isLoading, error, search } = useSearch();

  // Ejecutar búsqueda cuando llega el query por URL
  useEffect(() => {
    if (queryParam) search(queryParam, { genre: genreParam, year: yearParam });
  }, [queryParam, genreParam, yearParam]);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header de la página */}
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {queryParam ? `Resultados para "${queryParam}"` : 'Buscar'}
            </h1>
            {results?.total && (
              <p className="text-sm text-white/40">{results.total} resultados encontrados</p>
            )}
          </div>
        </div>

        {/* Filtros */}
        <SearchFilters />

        {/* Respuesta RAG del LLM */}
        <RAGResponse
          response={results?.rag}
          isLoading={isLoading}
          error={error}
        />

        {/* Resultados de canciones */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Canciones</h2>

          {isLoading ? (
            <LoadingSkeleton variant="card" rows={4} />
          ) : !results?.canciones?.length ? (
            <EmptyState
              icon="music"
              title="Sin resultados"
              message={queryParam ? 'No se encontraron canciones para tu búsqueda.' : 'Escribe algo para buscar.'}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {results.canciones.map((song) => (
                <Link key={song._id} href={`/song/${song._id}`}>
                  <SongCard
                    title={song.titulo}
                    artist={song.artista?.nombre || ''}
                    genre={song.genero || ''}
                    duration={formatDuration(song.duracion)}
                    plays={song.emociones?.[0] || ''}
                    coverUrl={song.portada_url}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}