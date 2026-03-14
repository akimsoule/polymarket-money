import type { ScanApiResponse, ScannerConfig } from "./types";

const AUTH_TOKEN_KEY = "polymarket_jwt";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ScanRequest {
  topN?: number;
  marketLimit?: number;
  config?: Partial<ScannerConfig>;
}

interface LoginResponse {
  token: string;
}

function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function readStoredToken(): string | null {
  return getAuthToken();
}

export function clearStoredToken(): void {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new ApiError(payload.error ?? "Login failed", response.status);
  }

  const payload = (await response.json()) as LoginResponse;
  if (globalThis.window !== undefined) {
    globalThis.window.localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  }
  return payload.token;
}

export async function runScan(request: ScanRequest): Promise<ScanApiResponse> {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new ApiError(
      payload.error ?? `HTTP ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<ScanApiResponse>;
}

export async function getScan(key?: string): Promise<ScanApiResponse> {
  const query = key ? `?key=${encodeURIComponent(key)}` : "";
  const response = await fetch(`/api/get-scan${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new ApiError(
      payload.error ?? `HTTP ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<ScanApiResponse>;
}
