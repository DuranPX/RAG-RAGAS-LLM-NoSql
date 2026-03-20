'use client';

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Play, Heart, MoreHorizontal, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Song } from '@/lib/mockData';

interface SongsTableProps {
  songs: Song[];
}

const SongsTable: React.FC<SongsTableProps> = ({ songs }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-[50px] text-white/40 text-[10px] font-bold uppercase tracking-wider">#</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Canción</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Artista</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider hidden md:table-cell">Álbum</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider hidden lg:table-cell">Género</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Duración</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Popularidad</TableHead>
            <TableHead className="text-right text-white/40 text-[10px] font-bold uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song, index) => (
            <TableRow key={song.id} className="border-white/5 hover:bg-white/10 transition-colors group">
              <TableCell className="text-white/40 font-medium text-xs">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="hidden group-hover:block h-3 w-3 text-purple-400" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/5 overflow-hidden">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
                    ) : (
                      <Music2 className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors leading-tight">{song.title}</span>
                    <span className="text-[10px] text-white/40 leading-tight md:hidden">{song.artist}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-white/60 text-xs hidden md:table-cell">
                {song.artist}
              </TableCell>
              <TableCell className="text-white/40 text-xs hidden md:table-cell italic">
                {song.album}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-white/10 text-white/40 font-normal">
                  {song.genre}
                </Badge>
              </TableCell>
              <TableCell className="text-white/60 text-xs font-mono">
                {song.duration}
              </TableCell>
              <TableCell>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" 
                    style={{ width: `${song.popularity}%` }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-pink-500">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                {/* TODO: fetch from Supabase cancion table */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SongsTable;
