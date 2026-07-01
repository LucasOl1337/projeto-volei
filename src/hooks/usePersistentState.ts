import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

const STORAGE_PREFIX = 'projeto-isa.';

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === null ? defaultValue : JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setValueState((previous) => {
      const next = typeof action === 'function'
        ? (action as (current: T) => T)(previous)
        : action;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Local persistence is best effort for the prototype.
      }
      return next;
    });
  }, [storageKey]);

  return [value, setValue];
}
