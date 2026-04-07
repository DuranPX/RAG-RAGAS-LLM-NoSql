'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';

// Géneros
const GENRES = ['Todos', 'Rock', 'Pop', 'Jazz', 'Clasic', 'Hip-Hop', 'Electronic', 
                'Reggaeton', 'Metal', 'Folklore', 'House', 'Pop Latino', 'Vallenato', 'Cumbia'];

// Años dinámicos
const currentYear = new Date().getFullYear();
const YEARS = ['Todos', ...Array.from({ length: 40 }, (_, i) => String(currentYear - i))];

export default function SearchFilters() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const activeGenre = searchParams.get('genre') ?? 'Todos';
  const activeYear  = searchParams.get('year')  ?? 'Todos';

  const updateFilter = useCallback((key: 'genre' | 'year', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'Todos') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <div className="flex flex-wrap items-start gap-6 py-3 border-y border-white/10">
      
      {/* Ícono */}
      <div className="flex items-center gap-2 text-white/40 pt-1">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">Filtros</span>
      </div>

      {/* Filtro Género — chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/40 uppercase tracking-widest">Género</span>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => updateFilter('genre', genre)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                activeGenre === genre
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'border-white/20 text-white/60 hover:border-purple-400 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro Año — select */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/40 uppercase tracking-widest">Año</span>
        <select
          value={activeYear}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="bg-transparent border border-white/20 text-white/80 rounded-lg px-3 py-1 text-sm cursor-pointer hover:border-purple-400 focus:outline-none focus:border-purple-400"
        >
          {YEARS.map((year) => (
            <option key={year} value={year} className="bg-gray-900">{year}</option>
          ))}
        </select>
      </div>

    </div>
  );
}