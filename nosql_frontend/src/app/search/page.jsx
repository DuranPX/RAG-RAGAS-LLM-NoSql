'use client';

import React from 'react';
import SearchBar from '@/shared/components/forms/SearchBar';
import RAGResponse from '@/shared/components/ui/RAGResponse';
import Badge from '@/shared/components/ui/Badge';

export default function SearchPage() {
  const genres = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Hip-Hop', 'Classical'];
  const years = ['2020s', '2010s', '2000s', '90s', '80s'];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Search & Discover</h1>
        <p className="text-gray-400">Find your favorite tracks or ask SpotiRAG for recommendations.</p>
      </div>

      <SearchBar isRAG={true} />

      <div className="mt-12 flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button key={genre} className="hover:scale-105 transition-transform">
                  <Badge variant="primary">{genre}</Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Year</h3>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button key={year} className="hover:scale-105 transition-transform">
                  <Badge variant="default">{year}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6">
            <RAGResponse 
              response="Based on your search for 'funky 70s rock', I recommend checking out tracks from Led Zeppelin and Queen. They have a great blend of classic rock with groovy basslines."
              sources={[
                { title: 'Trampled Under Foot', artist: 'Led Zeppelin' },
                { title: 'Another One Bites The Dust', artist: 'Queen' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
