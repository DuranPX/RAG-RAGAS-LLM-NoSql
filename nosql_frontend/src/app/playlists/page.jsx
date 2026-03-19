import React from 'react';
import PlaylistCard from '@/shared/components/cards/PlaylistCard';

export default function PlaylistsPage() {
  const playlists = [
    { id: '1', name: 'Chill Vibes', description: 'Relaxing tracks for your afternoon.', count: 24 },
    { id: '2', name: 'Workout Power', description: 'High energy beats.', count: 18 },
    { id: '3', name: 'Late Night Jazz', description: 'Smooth jazz for late hours.', count: 32 },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-8">My Playlists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
