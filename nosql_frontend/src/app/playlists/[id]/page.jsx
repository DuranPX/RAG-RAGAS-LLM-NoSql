import React from 'react';

export default function PlaylistDetailPage({ params }) {
  const { id } = params;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-8 mb-12">
        <div className="w-64 h-64 bg-emerald-500/20 rounded-2xl flex items-center justify-center shadow-2xl">
          <svg className="w-24 h-24 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-2">Playlist</p>
          <h1 className="text-6xl font-black mb-4">Chill Vibes</h1>
          <p className="text-gray-400">Playlist ID: {id} • Created by Juan Duran</p>
        </div>
      </div>

      <div className="bg-gray-900/30 rounded-3xl overflow-hidden border border-gray-800">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-800">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Album</th>
              <th className="px-6 py-4">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
              <td className="px-6 py-4 text-gray-400">1</td>
              <td className="px-6 py-4">
                <p className="font-bold text-white">Midnight City</p>
                <p className="text-xs text-gray-500">M83</p>
              </td>
              <td className="px-6 py-4 text-gray-400">Hurry Up, We're Dreaming</td>
              <td className="px-6 py-4 text-gray-400">4:03</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
