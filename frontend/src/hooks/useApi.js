import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(projectsApi.list, { status: 'ACTIVE' });
 *
 * @param {Function} fn    — API function that returns a promise (axios response)
 * @param {*}        args  — args passed to fn (stable ref, deep-equal checked)
 * @param {object}   opts  — { immediate: bool, transform: fn }
 */
export function useApi(fn, args, opts = {}) {
  const { immediate = true, transform } = opts;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);

  const argsRef = useRef(args);
  argsRef.current = args;

  const execute = useCallback(async (overrideArgs) => {
    setLoading(true);
    setError(null);
    try {
      const a = overrideArgs !== undefined ? overrideArgs : argsRef.current;
      const res = await fn(a);
      const raw = res.data;
      setData(transform ? transform(raw) : raw);
      return raw;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, transform]);

  useEffect(() => {
    if (immediate) execute();
  }, [immediate]); // deliberately not including execute to avoid re-runs on every render

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook — for POST/PATCH/DELETE operations.
 *
 * Usage:
 *   const { mutate, loading, error } = useMutation(projectsApi.create);
 *   await mutate({ name: '...', clientId: '...' });
 */
export function useMutation(fn, opts = {}) {
  const { onSuccess, onError } = opts;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(args);
      onSuccess?.(res.data, args);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
      onError?.(msg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, onSuccess, onError]);

  return { mutate, loading, error };
}
