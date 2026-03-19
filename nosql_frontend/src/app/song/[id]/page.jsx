import React from 'react';
import Badge from '@/shared/components/ui/Badge';

export default function SongDetailPage({ params }) {
  const { id } = params;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Metadata & Emotions */}
        <div className="space-y-8">
          <div className="aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center text-gray-500">
              Song Image Placeholder
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black mb-2">Midnight City</h1>
            <p className="text-xl text-emerald-400 font-medium mb-6">M83</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Synth-Pop</Badge>
              <Badge variant="secondary">Indie</Badge>
              <Badge variant="accent">Electronic</Badge>
            </div>
          </div>
          
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4">Emotions & Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Energy</p>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Mood: Nostalgic</p>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[70%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <div className="bg-gray-900 shadow-2xl rounded-3xl p-8 border border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">Lyrics</h3>
          <div className="text-xl font-medium text-gray-300 leading-relaxed space-y-6">
            <p>Waiting in a car</p>
            <p>Waiting for a ride in the dark</p>
            <p>At night the city grows</p>
            <p>Look at the horizon line</p>
            <p className="text-white">The city is my church</p>
            <p>It wraps me in its blinking lights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
