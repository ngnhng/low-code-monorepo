'use client';

import { useState } from 'react';
import { getLocalStorage, setLocalStorage } from 'lib/local-storage';

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getLocalStorage(key);
      if (!item) {
        return initialValue;
      }
      return isJsonString(item) ? JSON.parse(item) : item;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        typeof value === 'function' ? (value as Function)(storedValue) : value;

      setStoredValue(valueToStore);

      setLocalStorage(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
}
