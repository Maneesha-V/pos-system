import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { errMsg } from '../utils/apiError';

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = [], failMsg = 'Failed to load') {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    try {
      const res = await fetcher();
      if (id === latest.current) setData(res);
    } catch (e) {
      if (id === latest.current) toast.error(errMsg(e, failMsg));
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, deps);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload };
}