'use client';

import React from 'react';
import { Headphones, MapPin, Music2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ArtistCardProps {
  name: string;
  country: string;
  genre: string;
  listeners: string;
  imageUrl?: string;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, country, genre, listeners, imageUrl }) => {
  return (
    <Card className="flex flex-col items-center p-6 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
      <CardContent className="p-0 flex flex-col items-center space-y-4">
        {/* Circular Image */}
        <div className="relative group-hover:scale-105 transition-transform duration-300">
          <Avatar className="h-24 w-24 border-2 border-purple-500/20 group-hover:border-purple-500 transition-colors shadow-xl">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name} className="object-cover" />
            ) : (
              <AvatarImage src="" />
            )}
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold text-2xl">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* TODO: artist photo */}
          <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5 shadow-lg border-2 border-[#1a1a2e]">
            <Music2 className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Text Info */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors leading-tight">{name}</h3>
          
          <div className="flex items-center justify-center gap-1.5 text-white/40 text-[10px]">
            <MapPin className="h-3 w-3" />
            <span>{country}</span>
          </div>
          
          <div className="pt-2">
            <Badge variant="outline" className="text-[9px] py-0 px-2 border-white/10 text-white/60 font-medium tracking-wide">
              {genre}
            </Badge>
          </div>
        </div>

        {/* Listeners */}
        <div className="flex items-center gap-2 pt-2 text-purple-400/80 group-hover:text-purple-400 transition-colors">
          <Headphones className="h-4 w-4" />
          <span className="text-xs font-bold">{listeners} oyentes</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
