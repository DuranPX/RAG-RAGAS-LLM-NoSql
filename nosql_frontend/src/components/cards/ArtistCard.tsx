'use client';

import React from 'react';
import { Headphones, MapPin, Music2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ArtistCardProps {
  name: string;
  country: string;
  generos: string[];
  listeners: string;
  imageUrl?: string;

  onGenreClick?: (genre: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, country, generos, listeners, imageUrl, onGenreClick }) => {
  return (
    <Card className="flex flex-col items-center p-6 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
      <CardContent className="p-0 flex flex-col items-center space-y-4">
        {/* Circular Image */}
        <div className="relative group-hover:scale-105 transition-transform duration-300">
        </div>

        {/* Text Info */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors leading-tight">{name}</h3>
          
          <div className="flex items-center justify-center gap-1.5 text-white/40 text-[10px]">
            <MapPin className="h-3 w-3" />
            <span>{country}</span>
          </div>
          
          <div className="pt-2">
            <div className="flex flex-wrap justify-center gap-1 pt-2">
              {generos?.map((g, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  onClick={() => onGenreClick?.(g)} 
                  className="cursor-pointer text-[9px] py-0 px-2 border-white/10 text-white/60 font-medium tracking-wide hover:text-white"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
