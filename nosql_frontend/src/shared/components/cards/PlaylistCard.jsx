import React from 'react';
import Link from 'next/link';

/**
 * PlaylistCard component for displaying playlist previews.
 * 
 * @param {object} props - Component props.
 * @param {object} props.playlist - The playlist object.
 * @returns {JSX.Element}
 */
const PlaylistCard = ({ playlist }) => {
  const { id, name, description, coverUrl, count } = playlist || {};

  return (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center space-x-4 hover:bg-gray-800/50 transition-colors">
      <Link href={`/playlists/${id}`} className="flex items-center space-x-4 w-full">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={coverUrl || 'https://via.placeholder.com/150?text=Playlist'} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{name || 'Unnamed Playlist'}</h3>
          <p className="text-xs text-gray-400 line-clamp-1">{description || 'No description'}</p>
          <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-wider font-semibold">
            {count || 0} Songs
          </p>
        </div>
      </Link>
    </div>
  );
};

export default PlaylistCard;
