'use client';

import React from 'react';
import { Music2, PlayCircle, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SongCardProps {
  title: string;
  artist: string;
  genre: string;
  duration: string;
  plays: string;
  coverUrl?: string;
}

const SongCard: React.FC<SongCardProps> = ({ title, artist, genre, duration, plays, coverUrl }) => {
  return (
    <Card className="group relative w-[180px] bg-white/5 backdrop-blur-md border-white/10 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/50 cursor-pointer">
      <CardContent className="p-0">
        {/* Image Area */}
        <div className="relative aspect-square w-full">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Music2 className="text-white/80 h-10 w-10 group-hover:scale-110 transition-transform" />
            </div>
          )}
          {/* TODO: pass coverUrl prop */}
          
          {/* Overlay Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <PlayCircle className="text-white h-12 w-12 drop-shadow-lg" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-white truncate leading-tight">{title}</h4>
            <p className="text-xs text-white/50 truncate leading-tight">{artist}</p>
          </div>
          
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-purple-500/50 text-purple-300 font-normal">
            {genre}
          </Badge>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-purple-400" />
              <span>{plays}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongCard;
