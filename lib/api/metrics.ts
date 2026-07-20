import { apiFetch } from './apiFetch';
import type { UserMetrics } from '../types/metrics';

export function fetchUserMetrics(semester?: 1 | 2): Promise<UserMetrics> {
  const query = semester ? `?semester=${semester}` : '';
  return apiFetch<UserMetrics>(`/user-metrics${query}`);
}
