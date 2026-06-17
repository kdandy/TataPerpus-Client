import type { ApiResponse, PaginatedResponse } from "../types/api";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3440/api";

export class ApiError extends Error {
  status: number;
  errors: unknown[];

  constructor(message: string, status: number, errors: unknown[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  return localStorage.getItem("infobase_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("infobase_token", token);
  else localStorage.removeItem("infobase_token");
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const hasBody = options.body && !(options.body instanceof FormData);

  if (hasBody) headers.set("Content-Type", "application/json");

  const token = options.auth === false ? null : getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || "Request gagal", response.status, payload?.errors || []);
  }

  return payload as ApiResponse<T>;
}

export function listFetch<T>(path: string, options: RequestOptions = {}) {
  return apiFetch<T[]>(path, options) as Promise<PaginatedResponse<T>>;
}

export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}
