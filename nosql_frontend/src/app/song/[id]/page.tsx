// ================================================================
// /song/[id] — Página de detalle de canción
// Muestra letra, emociones, artista y álbum de una canción
// ================================================================

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { useApi } from '@/shared/hooks/useApi';
import { songService } from '@/api/services/songService';
import { Music, Clock, Disc, Globe, Heart } from 'lucide-react';
import Link from 'next/link';

const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function SongDetailPage() {
  const { id } = useParams();

  const { data: song, isLoading, error, refetch } = useApi(
    () => songService.getById(id),
    [id]
  );

  if (isLoading) return <AppShell><LoadingSkeleton variant="row" rows={8} /></AppShell>;
  if (error)    return <AppShell><ErrorState message={error} onRetry={refetch} /></AppShell>;
  if (!song)    return null;

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">

        {/* Header de la canción */}
        <div className="flex items-start gap-6">
          {/* Portada placeholder */}
          <div className="w-40 h-40 shrink-0 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Music className="h-14 w-14 text-purple-400/50" />
          </div>

          {/* Info principal */}
          <div className="space-y-3 flex-1">
            <h1 className="text-4xl font-bold text-white">{song.titulo}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              {/* Artista */}
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-purple-400" />
                {song.artista?.nombre || 'Artista desconocido'}
                {song.artista?.pais && ` · ${song.artista.pais}`}
              </span>

              {/* Álbum */}
              {song.album?.titulo && (
                <span className="flex items-center gap-1.5">
                  <Disc className="h-4 w-4 text-pink-400" />
                  {song.album.titulo}
                  {song.album?.anio && ` (${song.album.anio})`}
                </span>
              )}

              {/* Duración */}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-white/40" />
                {formatDuration(song.duracion)}
              </span>

              {/* Género */}
              {song.genero && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-0.5 rounded-full text-xs font-medium">
                  {song.genero}
                </span>
              )}
            </div>

            {/* Emociones */}
            {song.emociones?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Heart className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                {song.emociones.map((e, i) => (
                  <span
                    key={i}
                    className="text-xs bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full"
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Letra */}
        {song.letra && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">
              Letra
            </h2>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <pre className="text-white/70 text-sm leading-loose whitespace-pre-wrap font-sans">
                {song.letra}
              </pre>
            </div>
          </section>
        )}

        {/* Link volver */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </AppShell>
  );
}