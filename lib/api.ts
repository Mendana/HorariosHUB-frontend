import { ApiError } from './errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('Network error', 0, 'NETWORK_ERROR');
  }

  if (!res.ok) {
    const body: { message?: string; code?: string } = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Error ${res.status}`,
      res.status,
      body.code ?? `HTTP_${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Schedule ──────────────────────────────────────────────────

export function scheduleCopy(from: string): Promise<void> {
  return fetcher(`/schedule/copy?user=${encodeURIComponent(from)}`, {
    method: 'POST',
  });
}
