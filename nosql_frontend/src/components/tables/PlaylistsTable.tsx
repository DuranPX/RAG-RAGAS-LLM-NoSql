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
import { MoreHorizontal, ListMusic, User, Calendar, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PlaylistRow {
  id: string;
  title: string;
  description: string;
  songCount: number;
  owner: string;
  coverUrl?: string;
  createdAt: string;
}

interface PlaylistsTableProps {
  playlists: PlaylistRow[];
}

const PlaylistsTable: React.FC<PlaylistsTableProps> = ({ playlists }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Título</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Dueño</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">N° Canciones</TableHead>
            <TableHead className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Fecha creación</TableHead>
            <TableHead className="text-right text-white/40 text-[10px] font-bold uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((playlist) => (
            <TableRow key={playlist.id} className="border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
              <TableCell>
                <Link href={`/playlists/${playlist.id}`} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 overflow-hidden">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.title} className="h-full w-full object-cover" />
                    ) : (
                      <ListMusic className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors leading-tight">{playlist.title}</span>
                    <span className="text-[10px] text-white/40 leading-tight line-clamp-1">{playlist.description}</span>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <User className="h-3 w-3 text-white/30" />
                  <span>{playlist.owner}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                  <Music className="h-3 w-3 text-white/30" />
                  <span>{playlist.songCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <Calendar className="h-3 w-3 text-white/30" />
                  <span>{playlist.createdAt}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlaylistsTable;
