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

interface SongRow {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  plays: string;
  popularity: number;
  coverUrl?: string;
}

interface SongsTableProps {
  songs: SongRow[];
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
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Duración</TableHead>
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
              <TableCell className="text-white/60 text-xs font-mono">
                {song.duration}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SongsTable;
