import { useState, useEffect } from 'react';
import { IPO } from '../types';

let cachedIpos: IPO[] | null = null;
let fetchPromise: Promise<IPO[]> | null = null;

export function useLiveIPOs() {
  const [ipos, setIpos] = useState<IPO[]>(cachedIpos || []);
  const [loading, setLoading] = useState<boolean>(!cachedIpos);

  useEffect(() => {
    if (cachedIpos) {
      setLoading(false);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = fetch('http://localhost:3000/api/ipos')
        .then(r => r.json())
        .then(d => d.data || [])
        .catch(err => {
          console.error("Failed to fetch live IPOs", err);
          return [];
        });
    }
    fetchPromise.then(data => {
      cachedIpos = data;
      setIpos(data);
      setLoading(false);
    });
  }, []);

  return { ipos, loading };
}
