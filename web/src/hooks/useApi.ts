'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(path: string, options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const { initialData = null, immediate = true } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, [immediate, refetch]);

  return { data, loading, error, refetch };
}

export function useMutation<TInput, TOutput>(path: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body?: TInput): Promise<TOutput | null> => {
    setLoading(true);
    setError(null);
    try {
      let result: TOutput;
      if (method === 'DELETE') {
        result = await api.delete<TOutput>(path);
      } else if (method === 'PUT') {
        result = await api.put<TOutput>(path, body);
      } else {
        result = await api.post<TOutput>(path, body);
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Request failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
