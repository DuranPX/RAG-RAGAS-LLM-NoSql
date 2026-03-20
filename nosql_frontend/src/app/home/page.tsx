import React from 'react';
import AppShell from '@/components/layout/AppShell';
import SongCard from '@/components/cards/SongCard';
import ArtistCard from '@/components/cards/ArtistCard';
import SongsTable from '@/components/tables/SongsTable';
import { mockSongs, mockArtists } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-12">
        {/* Section 1 — Hero welcome strip */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-500 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
            <div className="max-w-xl space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Descubre tu música</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
              {/* TODO: replace with hero artwork 400x200px */}
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
          
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 custom-scrollbar snap-x">
             {/* TODO: replace with real API data from /api/canciones */}
             {mockSongs.slice(0, 6).map((song) => (
               <div key={song.id} className="snap-start shrink-0">
                 <SongCard 
                    title={song.title}
                    artist={song.artist}
                    genre={song.genre}
                    duration={song.duration}
                    plays={song.plays}
                 />
               </div>
             ))}
          </div>
        </section>

        {/* Section 3 — Artistas Populares */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Artistas Sugeridos</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {mockArtists.map((artist) => (
               <ArtistCard 
                  key={artist.id}
                  name={artist.name}
                  country={artist.country}
                  genre={artist.genre}
                  listeners={artist.listeners}
               />
             ))}
          </div>
        </section>

        {/* Section 4 — Tabla completa de canciones */}
        <section className="space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">Biblioteca de Canciones</h2>
            <div className="text-xs text-white/40">Total: {mockSongs.length} registros</div>
          </div>
          
          <SongsTable songs={mockSongs.slice(0, 6)} />
        </section>
      </div>
    </AppShell>
  );
}
