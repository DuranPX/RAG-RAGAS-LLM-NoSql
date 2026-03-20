'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import SongsTable from '@/components/tables/SongsTable';
import PlaylistCard from '@/components/cards/PlaylistCard';
import { mockSongs, mockPlaylists } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Play, Heart, Share2, MoreHorizontal, Clock, Users, Music } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const playlist = mockPlaylists.find(p => p.id === id) || mockPlaylists[0];

  return (
    <AppShell>
      <div className="space-y-10 pb-12">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1e30] to-[#0d0d18] border border-white/5 p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-end gap-8">
            {/* Cover Art */}
            <div className="w-full md:w-[240px] aspect-square rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl flex items-center justify-center shrink-0 overflow-hidden group border border-white/10">
              <Music className="h-24 w-24 text-white/20 group-hover:scale-110 transition-transform duration-500" />
              {/* TODO: Large cover art placeholder (200x200 rounded-xl gradient) */}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Playlist</span>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">{playlist.title}</h1>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-white/60">
                   <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {playlist.owner.substring(0,2)}
                   </div>
                   <span className="text-sm font-bold text-white/80">{playlist.owner}</span>
                   <span className="text-white/20">•</span>
                   <span className="text-sm">Creada en {playlist.createdAt}</span>
                </div>
                
                <p className="text-white/40 text-sm max-w-xl line-clamp-2 italic leading-relaxed">
                   {playlist.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                   <div className="flex items-center gap-2 text-white/40">
                      <Music className="h-4 w-4" />
                      <span className="text-xs font-medium">{playlist.songCount} canciones</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/40">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">~2h 45m</span>
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
            {/* Sort/Filter controls placeholder */}
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-white/40 text-xs hover:text-white">Recientes</Button>
               <Button variant="ghost" size="sm" className="text-white/40 text-xs hover:text-white">Popularidad</Button>
            </div>
          </div>
          
          <SongsTable songs={mockSongs.slice(0, 5)} />
        </section>

        {/* Related playlists section */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">También te puede gustar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlaylists.slice(0, 3).map((p) => (
              <PlaylistCard 
                key={p.id}
                id={p.id}
                title={p.title}
                description={p.description}
                songCount={p.songCount}
                owner={p.owner}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
