'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import SongsTable from '@/components/tables/SongsTable';
import PlaylistCard from '@/components/cards/PlaylistCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/shared/hooks/useApi';
import { playlistService } from '@/api/services/playlistService';
import { userService } from '@/api/services/userService';
import { Button } from '@/components/ui/button';
import { Play, Heart, Share2, MoreHorizontal, Clock, Users, Music } from 'lucide-react';
import { useParams } from 'next/navigation';

// Formatea segundos a mm:ss
const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Calcula duración total de las canciones en la playlist
const calcTotalDuration = (canciones) => {
  if (!canciones?.length) return '0m';
  const totalSec = canciones.reduce((acc, c) => acc + (c.duracion || 0), 0);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const [ownerName, setOwnerName] = useState('Usuario');
  const [relatedPlaylists, setRelatedPlaylists] = useState([]);

  // Fetch principal — la playlist
  const { data: playlist, isLoading, error, refetch } = useApi(
    () => playlistService.getById(id),
    [id]
  );

  // Efectos secundarios: resolver nombre del dueño + playlists relacionadas
  useEffect(() => {
    if (!playlist?.id_usuario) return;

    const fetchSecondary = async () => {
      // Nombre del dueño
      try {
        const user = await userService.getById(playlist.id_usuario);
        setOwnerName(user.nombre || 'Usuario');
      } catch {
        setOwnerName('Usuario');
      }

      // Playlists relacionadas
      try {
        const userPlaylists = await playlistService.getByUser(playlist.id_usuario);
        const related = userPlaylists
          .filter(p => p._id !== playlist._id)
          .slice(0, 3);
        setRelatedPlaylists(related);
      } catch {
        setRelatedPlaylists([]);
      }
    };

    fetchSecondary();
  }, [playlist]);

  // Mapea canciones embebidas al formato SongRow para la tabla
  const mapPlaylistSongToRow = (cancion, index) => ({
    id: cancion.id_cancion || `song-${index}`,
    title: cancion.titulo || '',
    artist: cancion.nombre_artista || '',
    album: '',
    genre: '',
    duration: formatDuration(cancion.duracion),
    plays: '',
    popularity: Math.floor(Math.random() * 40) + 60,
    coverUrl: cancion.portada_url || undefined,
  });

  // --- Estados de error y carga ---

  if (error) {
    return (
      <AppShell>
        <ErrorState 
          message={error} 
          onRetry={refetch} 
          variant="fullpage" 
        />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-10 pb-12">
          <LoadingSkeleton variant="hero" />
          <LoadingSkeleton variant="row" rows={5} />
        </div>
      </AppShell>
    );
  }

  if (!playlist) {
    return (
      <AppShell>
        <EmptyState 
          icon="playlist"
          title="Playlist no encontrada"
          message="La playlist que buscas no existe o fue eliminada."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-10 pb-12">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1e30] to-[#0d0d18] border border-white/5 p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-end gap-8">
            {/* Cover Art */}
            <div className="w-full md:w-[240px] aspect-square rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl flex items-center justify-center shrink-0 overflow-hidden group border border-white/10">
              {playlist.portada?.url ? (
                <img src={playlist.portada.url} alt={playlist.titulo} className="w-full h-full object-cover" />
              ) : (
                <Music className="h-24 w-24 text-white/20 group-hover:scale-110 transition-transform duration-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Playlist</span>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">{playlist.titulo}</h1>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-white/60">
                   <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {ownerName.substring(0,2)}
                   </div>
                   <span className="text-sm font-bold text-white/80">{ownerName}</span>
                   <span className="text-white/20">•</span>
                   <span className="text-sm">Creada el {new Date(playlist.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                
                {playlist.descripcion && (
                  <p className="text-white/40 text-sm max-w-xl line-clamp-2 italic leading-relaxed">
                     {playlist.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-2">
                   <div className="flex items-center gap-2 text-white/40">
                      <Music className="h-4 w-4" />
                      <span className="text-xs font-medium">{playlist.canciones?.length || 0} canciones</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/40">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">~{calcTotalDuration(playlist.canciones)}</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/40">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">1,240 seguidores</span>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 font-bold shadow-lg shadow-purple-600/20 group">
                  <Play className="mr-2 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                  Reproducir
                </Button>
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 px-6">
                  <Heart className="mr-2 h-5 w-5" />
                  Guardar
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 w-12">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 w-12">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-full bg-purple-600/10 blur-[120px] -z-10 rounded-full" />
        </section>

        {/* Songs in playlist section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">Canciones</h2>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-white/40 text-xs hover:text-white">Recientes</Button>
               <Button variant="ghost" size="sm" className="text-white/40 text-xs hover:text-white">Popularidad</Button>
            </div>
          </div>
          
          {playlist.canciones?.length > 0 ? (
            <SongsTable songs={playlist.canciones.map(mapPlaylistSongToRow)} />
          ) : (
            <EmptyState
              icon="music"
              title="Sin canciones"
              message="Esta playlist aún no tiene canciones."
            />
          )}
        </section>

        {/* Related playlists section */}
        {relatedPlaylists.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">También te puede gustar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaylists.map((p) => (
                <PlaylistCard 
                  key={p._id}
                  id={p._id}
                  title={p.titulo}
                  description={p.descripcion || ''}
                  songCount={p.canciones?.length || 0}
                  owner={ownerName}
                  coverUrl={p.portada?.url}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
