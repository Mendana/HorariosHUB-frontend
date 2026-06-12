import { apiFetch } from "./apiFetch";

/* 
    Endpoint for user login: POST /auth/login
    Body: { email: string, password: string }
*/ 
export function authLogin(email: string, password: string): Promise<void> {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
}

export function authRegister(email: string, password: string): Promise<void> {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
}

export function authVerify(token: string): Promise<void> {
    return apiFetch(`/auth/verify?token=${encodeURIComponent(token)}`);
}

export function authRecover(email: string): Promise<void> {
    return apiFetch('/auth/recover', {
        method: 'POST',
        body: JSON.stringify({ email }),
    })
}

export function authResetPassword(token: string, password: string): Promise<void> {
    return apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    })
}

export function authLogout(): Promise<void> {
    return apiFetch('/auth/logout', { method: 'POST' });
}