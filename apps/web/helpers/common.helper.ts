export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const isClient = typeof window !== "undefined";
export const CLIENT_BASE_URL = isClient ? window.location.origin : "";

