'use client';

import React, { useState } from 'react';
import { searchService } from '@/api/services/searchService';
import ArtistCard from '@/components/cards/ArtistCard';

const Search = () => {

  const [texto, setTexto] = useState('');
  const [anio, setAnio] = useState('');
  const [genero, setGenero] = useState('');

  const [results, setResults] = useState<any>({
    artists: [],
    albums: []
  });

  const handleSearch = async () => {
    const filters: any = {};

    if (texto) filters.texto = texto;
    if (anio) filters.anio = Number(anio);
    if (genero) filters.genero = genero;

    const res = await searchService.search(filters);

    setResults(res);
  };

  return (
    <div className="p-6 space-y-4">

      {/* FILTROS */}
      <div className="flex gap-2">

        <input
          placeholder="Buscar..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="p-2 rounded bg-black text-white"
        />

        <input
          type="number"
          placeholder="Año"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          className="p-2 rounded bg-black text-white"
        />

        <input
          placeholder="Género"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="p-2 rounded bg-black text-white"
        />

        <button
          onClick={handleSearch}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* ARTISTS */}
      <div>
        <h2 className="text-white text-xl mb-2">Artistas</h2>

        <div className="grid grid-cols-3 gap-4">
          {results.artists.map((artist: any) => (
            <ArtistCard
              key={artist._id}
              name={artist.nombre}
              country={artist.pais}
              genres={artist.generos}
              listeners="1000"

              onGenreClick={(g) => {
                setGenero(g);
                handleSearch();
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Search;