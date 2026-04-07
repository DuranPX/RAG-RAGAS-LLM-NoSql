// ================================================================
// SearchBar.jsx — Barra de búsqueda conectada al backend RAG
// Usa el hook useSearch para manejar estado y llamadas
// ================================================================

'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/shared/hooks/useSearch';
import { useRouter } from 'next/navigation';

const SearchBar = ({ className = '', onResults = undefined }) => {
  const router = useRouter();
  const inputRef = useRef(null);
  const { query, setQuery, isLoading, error, search, clearSearch } = useSearch();

  // Debounce: esperar 500ms después de que el usuario deja de escribir
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      search(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      // Navegar a la página de búsqueda con el query
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Ícono izquierdo — spinner si cargando, lupa si no */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
        )}
      </div>

      <div className="flex gap-2 w-full">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar canciones, artistas..."
          className="flex-1 bg-white/5 border-white/10 rounded-full pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:ring-purple-500"
        />

        {/* Filters */}
        <select
          id="genre"
          className="hidden md:block bg-white/5 border border-white/10 rounded-full text-white/70 text-xs px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
          onChange={(e) => setQuery(`${query} genero:${e.target.value}`.trim())}
        >
          <option value="" className="bg-black">Género</option>
          <option value="Pop" className="bg-black">Pop</option>
          <option value="Rock" className="bg-black">Rock</option>
          <option value="Hip-Hop" className="bg-black">Hip-Hop</option>
          <option value="Electronic" className="bg-black">Electronic</option>
        </select>
        <select
          id="year"
          className="hidden md:block bg-white/5 border border-white/10 rounded-full text-white/70 text-xs px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
          onChange={(e) => setQuery(`${query} año:${e.target.value}`.trim())}
        >
          <option value="" className="bg-black">Año</option>
          <option value="2024" className="bg-black">2024</option>
          <option value="2023" className="bg-black">2023</option>
          <option value="2022" className="bg-black">2022</option>
          <option value="2000s" className="bg-black">Los 2000s</option>
        </select>
      </div>

      {/* Botón limpiar — aparece solo si hay texto */}
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-36 md:right-[200px] top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Mensaje de error debajo del input */}
      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default SearchBar;