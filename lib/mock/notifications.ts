import type { Notification } from '@/lib/types/notifications';

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  // ── Unread ──────────────────────────────────────────────────────────────────
  {
    id: 'notif-001',
    type: 'proposal_approved',
    title: 'Propuesta aprobada',
    body: 'Tu propuesta de cambio en ALG ha sido aprobada',
    sessionId: null,
    proposalId: 'prop-001',
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: 'notif-002',
    type: 'proposal_created',
    title: 'Nueva propuesta pendiente',
    body: 'Hay una nueva propuesta de CDI pendiente de revisión',
    sessionId: null,
    proposalId: 'prop-002',
    read: false,
    createdAt: hoursAgo(3),
  },
  {
    id: 'notif-003',
    type: 'session_modified',
    title: 'Clase modificada',
    body: 'La clase de PRG del 24/03 ha sido modificada',
    sessionId: 'sess-003',
    proposalId: null,
    read: false,
    createdAt: hoursAgo(5),
  },
  {
    id: 'notif-006',
    type: 'proposal_created',
    title: 'Nueva propuesta pendiente',
    body: 'Hay una nueva propuesta de SO pendiente de revisión',
    sessionId: null,
    proposalId: 'prop-006',
    read: false,
    createdAt: daysAgo(2),
  },
  {
    id: 'notif-009',
    type: 'session_deleted',
    title: 'Clase eliminada',
    body: 'La clase de ALB del 14/04 ha sido cancelada',
    sessionId: 'sess-009',
    proposalId: null,
    read: false,
    createdAt: daysAgo(1),
  },

  // ── Read ─────────────────────────────────────────────────────────────────────
  {
    id: 'notif-004',
    type: 'proposal_rejected',
    title: 'Propuesta rechazada',
    body: 'Tu propuesta de cambio en GEO ha sido rechazada',
    sessionId: null,
    proposalId: 'prop-004',
    read: true,
    createdAt: daysAgo(1),
  },
  {
    id: 'notif-005',
    type: 'proposal_approved',
    title: 'Propuesta aprobada',
    body: 'Tu propuesta de cambio en BDA ha sido aprobada',
    sessionId: null,
    proposalId: 'prop-005',
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'notif-007',
    type: 'session_modified',
    title: 'Clase modificada',
    body: 'La clase de EST del 26/03 ha cambiado de aula',
    sessionId: 'sess-007',
    proposalId: null,
    read: true,
    createdAt: daysAgo(4),
  },
  {
    id: 'notif-008',
    type: 'proposal_rejected',
    title: 'Propuesta rechazada',
    body: 'Tu propuesta de cambio en IA ha sido rechazada',
    sessionId: null,
    proposalId: 'prop-008',
    read: true,
    createdAt: daysAgo(5),
  },
  {
    id: 'notif-010',
    type: 'exam_added',
    title: 'Examen añadido',
    body: 'Se ha añadido un examen de ALG para el 15/06',
    sessionId: 'sess-010',
    proposalId: null,
    read: true,
    createdAt: daysAgo(3),
  },
];
