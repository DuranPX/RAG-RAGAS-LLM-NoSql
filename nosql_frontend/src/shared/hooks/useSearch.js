// ================================================================
// useSearch.js — Hook para búsqueda RAG
// Maneja el estado de búsqueda y la llamada al backend
// ================================================================

import { useState, useCallback } from 'react';
import { searchService } from '@/api/services/searchService';

export const useSearch = () => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  const search = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery?.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        texto: searchQuery,
        ...(filters.genre && { genero: filters.genre === 'Todos' ? '' : filters.genre }),
        ...(filters.year && { anio: filters.year === 'Todos' ? '' : filters.year }),
        ...(filters.country && { pais: filters.country })
      };
      const data = await searchService.search(payload);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Error al buscar');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, search, clearSearch };
};