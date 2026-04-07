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
  const { results, isLoading, error, search } = useSearch();

  // Ejecutar búsqueda cuando llega el query por URL
  useEffect(() => {
    if (queryParam) search(queryParam);
  }, [queryParam]);

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
            {(results?.albums?.length > 0 || results?.artistas?.length > 0) && (
              <p className="text-sm text-white/40">{(results?.albums?.length || 0) + (results?.artistas?.length || 0)} resultados encontrados</p>
            )}
          </div>
        </div>

        {/* Resultados */}
        <section className="space-y-8">
          {isLoading ? (
            <LoadingSkeleton variant="card" rows={4} />
          ) : (!results?.albums?.length && !results?.artistas?.length) ? (
            <EmptyState
              icon="music"
              title="Sin resultados"
              message={queryParam ? 'No se encontraron resultados para tu búsqueda.' : 'Escribe algo para buscar.'}
            />
          ) : (
            <>
              {results?.artistas && results.artistas.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/80">Artistas</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {results.artistas.map((artista) => (
                      <Link key={artista._id} href={`/artist/${artista._id}`}>
                        <SongCard
                          title={artista.nombre}
                          artist={artista.pais || ''}
                          genre={artista.generos?.[0] || ''}
                          duration={''}
                          plays={'Artista'}
                          coverUrl={artista.imagen?.url || ''}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.albums && results.albums.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/80">Álbumes</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {results.albums.map((album) => (
                      <Link key={album._id} href={`/album/${album._id}`}>
                        <SongCard
                          title={album.titulo}
                          artist={''}
                          genre={album.anio_lanzamiento ? album.anio_lanzamiento.toString() : ''}
                          duration={''}
                          plays={album.tipo}
                          coverUrl={album.portada?.url}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}