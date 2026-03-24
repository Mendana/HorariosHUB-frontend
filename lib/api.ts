const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface ApiError extends Error {
  status?: number;
}

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body: { message?: string } = await res.json().catch(() => ({}));
    const err: ApiError = new Error(body.message ?? `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────

export function authLogin(email: string, password: string): Promise<void> {
  return fetcher('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(email: string, password: string): Promise<void> {
  return fetcher('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authVerify(token: string): Promise<void> {
  return fetcher(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}

export function authRecover(email: string): Promise<void> {
  return fetcher('/api/auth/recover', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function authResetPassword(token: string, password: string): Promise<void> {
  return fetcher('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function authLogout(): Promise<void> {
  return fetcher('/api/auth/logout', { method: 'POST' });
}
