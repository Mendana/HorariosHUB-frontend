import { apiFetch } from './apiFetch';
import type { UserMetrics, WeeklyMetric } from '../types/metrics';

export function fetchUserMetrics(semester?: 1 | 2): Promise<UserMetrics> {
  const query = semester ? `?semester=${semester}` : '';
  return apiFetch<UserMetrics>(`/user-metrics${query}`);
}

export function fetchUserMetricsWeekly(semester?: 1 | 2): Promise<WeeklyMetric[]> {
  const query = semester ? `?semester=${semester}` : '';
  return apiFetch<WeeklyMetric[]>(`/user-metrics/weekly${query}`);
}
