'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import PlaylistCard from '@/components/cards/PlaylistCard';
import { mockPlaylists } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PlaylistsPage() {
  const [activeTab, setActiveTab] = useState('Todas');

  const tabs = ['Todas', 'Mis Favoritas', 'Recientes'];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Mis Playlists</h1>
            <p className="text-white/40 text-sm max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Gestiona y analiza tus listas de reproducción personalizadas.
            </p>
          </div>
          <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 font-bold shadow-lg shadow-purple-600/20">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Playlist
          </Button>
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
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {mockPlaylists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id}
              id={playlist.id}
              title={playlist.title}
              description={playlist.description}
              songCount={playlist.songCount}
              owner={playlist.owner}
            />
          ))}
          {/* TODO: fetch from /api/playlists */}
        </div>
      </div>
    </AppShell>
  );
}
