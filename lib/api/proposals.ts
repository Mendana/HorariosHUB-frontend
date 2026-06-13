import type {
  CreateProposalInput,
  GetProposalsParams,
  ProposalsResponse,
} from '../types/proposals';
import { apiFetch } from './apiFetch';

interface ProposalMutationResponse {
  id: string;
  status: string;
  createdAt?: string;
}

export async function fetchProposals(params: GetProposalsParams): Promise<ProposalsResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return apiFetch<ProposalsResponse>(`/proposals?${qs.toString()}`);
}

export async function fetchMyProposals(params: Pick<GetProposalsParams, 'page' | 'limit'>): Promise<ProposalsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return apiFetch<ProposalsResponse>(`/proposals/mine?${qs.toString()}`);
}

export function createProposal(input: CreateProposalInput): Promise<ProposalMutationResponse> {
  return apiFetch<ProposalMutationResponse>('/proposals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function approveProposal(id: string): Promise<ProposalMutationResponse> {
  return apiFetch<ProposalMutationResponse>(`/proposals/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
  });
}

export function rejectProposal(id: string): Promise<ProposalMutationResponse> {
  return apiFetch<ProposalMutationResponse>(`/proposals/${encodeURIComponent(id)}/reject`, {
    method: 'PATCH',
  });
}
