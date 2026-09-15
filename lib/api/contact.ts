import { apiFetch } from './apiFetch';
import type { FeedbackRequest } from '../types/contact';

interface FeedbackResponse {
  message: string;
}

export function sendFeedback(payload: FeedbackRequest): Promise<FeedbackResponse> {
  return apiFetch<FeedbackResponse>('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
