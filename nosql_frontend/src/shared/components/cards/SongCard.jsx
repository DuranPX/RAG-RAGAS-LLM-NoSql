import React from 'react';
import Link from 'next/link';
import Badge from '../ui/Badge';

/**
 * SongCard component for displaying song previews.
 * 
 * @param {object} props - Component props.
 * @param {object} props.song - The song object.
 * @returns {JSX.Element}
 */
const SongCard = ({ song }) => {
  const { id, title, artist, coverUrl, genres = [], year } = song || {};

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group">
      <Link href={`/song/${id}`}>
        <div className="relative aspect-square">
          <img 
            src={coverUrl || 'https://via.placeholder.com/300?text=No+Cover'} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white truncate">{title || 'Unknown Song'}</h3>
          <p className="text-sm text-gray-400 truncate">{artist || 'Unknown Artist'}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="primary">{genre}</Badge>
            ))}
            {year && <Badge variant="default">{year}</Badge>}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SongCard;
