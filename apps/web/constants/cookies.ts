type ValueOf<T> = T[keyof T];

export const COOKIE_KEY = {
  ACCESS_TOKEN: 'low-code_access-token',
  REFRESH_TOKEN: 'low-code_refresh-token',
} as const;

export type CookieKey = ValueOf<typeof COOKIE_KEY>;

