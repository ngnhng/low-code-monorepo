'use client';

import { useState } from 'react';
import { getLocalStorage, setLocalStorage } from 'lib/local-storage';

export const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
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

  const setValue = (value: any) => {
    try {
      const valueToStore =
        typeof value === 'function' ? value(storedValue) : value;

      setStoredValue(valueToStore);

      setLocalStorage(key, valueToStore);
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
