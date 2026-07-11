import type { User, UserRole } from '../types/users';
import { apiFetch } from './apiFetch';

interface BackendUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function fetchUsers(): Promise<User[]> {
  const data = await apiFetch<{ users: BackendUser[] }>('/users');
  return data.users.map((u) => ({ id: u.id, email: u.email, role: u.role }));
}

export function changeUserRole(id: string, role: UserRole): Promise<void> {
  return apiFetch(`/users/${encodeURIComponent(id)}/change/${encodeURIComponent(role)}`, {
    method: 'PATCH',
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch(`/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
