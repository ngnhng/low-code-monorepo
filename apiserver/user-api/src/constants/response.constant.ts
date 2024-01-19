type ValueOf<T> = T[keyof T];

export const ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type OrderType = ValueOf<typeof ORDER>;

export const PAGING_LIMIT = 10;

export const PAGING_LIMIT_MAX = 50;
