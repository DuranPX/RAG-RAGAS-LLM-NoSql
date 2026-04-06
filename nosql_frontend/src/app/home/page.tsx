'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import SongCard from '@/components/cards/SongCard';
import ArtistCard from '@/components/cards/ArtistCard';
import SongsTable from '@/components/tables/SongsTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/shared/hooks/useApi';
import { songService } from '@/api/services/songService';
import { artistService } from '@/api/services/artistService';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Formatea segundos a mm:ss
const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function HomePage() {
  const { data: songs, isLoading: loadingSongs, error: errorSongs, refetch: refetchSongs } = useApi(
    () => songService.getAll(),
    []
  );

  const { data: artists, isLoading: loadingArtists, error: errorArtists, refetch: refetchArtists } = useApi(
    () => artistService.getAll(),
    []
  );

  const isLoading = loadingSongs || loadingArtists;
  const hasError = errorSongs || errorArtists;

  // Mapea canciones del backend al formato de SongsTable (SongRow)
  const mapSongToRow = (song) => ({
    id: song._id,
    title: song.titulo,
    artist: song.artista?.nombre || song.nombre_artista || '',
    album: song.album?.titulo || '',
    genre: song.genero || '',
    duration: formatDuration(song.duracion),
    plays: song.genero || '',
    popularity: Math.floor(Math.random() * 40) + 60,
    coverUrl: song.portada_url || undefined,
  });

  const handleRetry = () => {
    refetchSongs();
    refetchArtists();
  };

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Section 1 — Hero welcome strip */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-500 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
            <div className="max-w-xl space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Descubre tu música</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Explora el ecosistema musical con IA. Busca artistas, álbumes y canciones mediante consultas semánticas y descubre nuevas emociones.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button className="bg-white text-purple-700 hover:bg-purple-50 rounded-full px-8 py-6 h-auto font-bold text-lg shadow-lg group">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Explorar ahora
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full px-6 h-12 font-medium">
                  Saber más
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-[400px] h-[200px] shrink-0">
              <div className="w-full h-full bg-purple-400/20 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-center group cursor-pointer hover:bg-purple-400/30 transition-all border-dashed">
                <ImageIcon className="h-12 w-12 text-white/40 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-white/40 text-sm font-medium">Hero Artwork Placeholder</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl" />
        </section>

        {/* Section 2 — Canciones Destacadas */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Canciones Destacadas</h2>
            </div>
            <Link href="/playlists" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group">
              Ver todo
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {errorSongs ? (
            <ErrorState message={errorSongs} onRetry={refetchSongs} />
          ) : loadingSongs ? (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[180px] h-[280px] rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !songs?.length ? (
            <EmptyState 
              icon="music"
              title="Sin canciones"
              message="Aún no hay canciones en la base de datos. Ejecuta el seed para poblar datos."
            />
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 custom-scrollbar snap-x">
              {songs.slice(0, 6).map((song) => (
                <div key={song._id} className="snap-start shrink-0">
                  <SongCard 
                    title={song.titulo}
                    artist={song.artista?.nombre || song.nombre_artista || ''}
                    genre={song.genero || ''}
                    duration={formatDuration(song.duracion)}
                    plays={song.emociones?.[0] || song.genero || ''}
                    coverUrl={song.portada_url}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3 — Artistas Populares */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Artistas Sugeridos</h2>
          </div>
          
          {errorArtists ? (
            <ErrorState message={errorArtists} onRetry={refetchArtists} />
          ) : loadingArtists ? (
            <LoadingSkeleton variant="card" rows={4} />
          ) : !artists?.length ? (
            <EmptyState 
              icon="users"
              title="Sin artistas"
              message="No hay artistas registrados aún."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <ArtistCard 
                  key={artist._id}
                  name={artist.nombre}
                  country={artist.pais || 'Desconocido'}
                  genre={artist.generos?.[0] || 'N/A'}
                  listeners={''}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 4 — Tabla completa de canciones */}
        <section className="space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">Biblioteca de Canciones</h2>
            <div className="text-xs text-white/40">Total: {songs?.length || 0} registros</div>
          </div>
          
          {errorSongs ? (
            <ErrorState message={errorSongs} onRetry={refetchSongs} />
          ) : loadingSongs ? (
            <LoadingSkeleton variant="row" rows={6} />
          ) : !songs?.length ? (
            <EmptyState 
              icon="music"
              title="Sin canciones"
              message="Ejecuta el seed para poblar la biblioteca."
            />
          ) : (
            <SongsTable songs={songs.slice(0, 6).map(mapSongToRow)} />
          )}
        </section>
      </div>
    </AppShell>
  );
}
