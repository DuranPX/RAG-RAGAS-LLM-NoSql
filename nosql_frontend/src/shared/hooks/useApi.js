'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import handleError from '@/api/errorHandler';

/**
 * Hook genérico para llamadas a la API.
 * 
 * Encapsula useState/useEffect con manejo de errores centralizado.
 * Extrae mensajes amigables usando errorHandler.js.
 * 
 * @param fetcher - Función async que retorna los datos
 * @param deps - Array de dependencias (como useEffect)
 * @returns { data, isLoading, error, refetch }
 * 
 * @example
 * const { data: songs, isLoading, error, refetch } = useApi(
 *   () => songService.getAll(),
 *   []
 * );
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref para evitar state updates en componentes desmontados
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const message = handleError(err);
        setError(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch };
}
