'use client';

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import PlaylistCard from '@/components/cards/PlaylistCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/shared/hooks/useApi';
import { playlistService } from '@/api/services/playlistService';
import { userService } from '@/api/services/userService';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PlaylistsPage() {
  const [activeTab, setActiveTab] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Todas', 'Mis Favoritas', 'Recientes'];

  // Fetch combinado: usuarios + sus playlists
  const { data, isLoading, error, refetch } = useApi(async () => {
    const allUsers = await userService.getAll();
    const usersMap = {};
    if (Array.isArray(allUsers)) {
      allUsers.forEach(u => { usersMap[u._id] = u.nombre; });
    }

    const playlistPromises = Object.keys(usersMap).map(userId =>
      playlistService.getByUser(userId).catch(() => [])
    );
    const playlistArrays = await Promise.all(playlistPromises);
    const allPlaylists = playlistArrays.flat();

    return { playlists: allPlaylists, users: usersMap };
  }, []);

  const playlists = data?.playlists || [];
  const users = data?.users || {};

  // Filtrar playlists por búsqueda
  const filteredPlaylists = useMemo(() => 
    playlists.filter(p =>
      !searchQuery || p.titulo?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [playlists, searchQuery]
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Mis Playlists</h1>
            <p className="text-white/40 text-sm max-w-lg">
              Gestiona y analiza tus listas de reproducción personalizadas.
            </p>
          </div>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-1 p-1 bg-black/20 rounded-xl w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
            <Input 
              placeholder="Filtrar playlists..." 
              className="bg-transparent border-none focus-visible:ring-0 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <LoadingSkeleton variant="card" rows={8} />
        ) : !filteredPlaylists.length ? (
          <EmptyState 
            icon="playlist"
            title={searchQuery ? 'Sin resultados' : 'Sin playlists'}
            message={searchQuery 
              ? `No se encontraron playlists que coincidan con "${searchQuery}".`
              : 'Aún no hay playlists. Crea una nueva o ejecuta el seed para poblar datos.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredPlaylists.map((playlist) => (
              <PlaylistCard 
                key={playlist._id}
                id={playlist._id}
                title={playlist.titulo}
                description={playlist.descripcion || ''}
                songCount={playlist.canciones?.length || 0}
                owner={users[playlist.id_usuario] || 'Usuario'}
                coverUrl={playlist.portada?.url}
                songCovers={playlist.canciones?.filter(c => c.portada_url).map(c => c.portada_url)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
