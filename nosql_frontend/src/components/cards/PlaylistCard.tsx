'use client';

import React from 'react';
import { Heart, MoreHorizontal, Music } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface PlaylistCardProps {
  id: string;
  title: string;
  description: string;
  songCount: number;
  owner: string;
  coverUrl?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ id, title, description, songCount, owner, coverUrl }) => {
  return (
    <Card className="group bg-white/5 border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
      <Link href={`/playlists/${id}`}>
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="relative aspect-video w-full overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                <Music className="text-white/40 h-16 w-16" />
              </div>
            )}
            {/* TODO: image placeholder */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-white text-lg truncate group-hover:text-purple-400 transition-colors">{title}</h3>
              <p className="text-xs text-white/50 line-clamp-2 mt-1 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 border border-white/10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-600 text-[8px] text-white">
                  {owner.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-white/40 font-medium">{owner}</span>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <Badge variant="secondary" className="bg-white/5 text-white/60 text-[10px] hover:bg-white/10">
          {songCount} canciones
        </Badge>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-pink-500 transition-colors">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlaylistCard;
