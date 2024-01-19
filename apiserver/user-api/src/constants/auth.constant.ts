type ValueOf<T> = T[keyof T];
export const AUTH = {
  IS_PUBLIC: 'ASC',
  DESC: 'DESC',
} as const;

export const TOKEN_SERVICE = 'ITokenService';

export type RouteAuthType = ValueOf<typeof AUTH>;
