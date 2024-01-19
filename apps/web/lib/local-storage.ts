export const getLocalStorage = (key: string) => {
  if (!window || typeof window === "undefined") return ;
  try {
    return window.localStorage.getItem(key);
  } catch {
    window.localStorage.removeItem(key);
    return ;
  }
};

export const setLocalStorage = (key: string, value: any): boolean => {
  if (key && value) {
    const _value = ['string', 'boolean'].includes(typeof value)
      ? value
      : JSON.stringify(value);
    if (_value) {
      window.localStorage.setItem(key, _value);
      return true;
    }
  }

  return false;
};

export const removeLocalStorage = (key: string) => {
  if (key) window.localStorage.removeItem(key);
};
