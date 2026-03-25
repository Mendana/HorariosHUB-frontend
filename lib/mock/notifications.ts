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
    message: 'Tu propuesta de cambio en ALG ha sido aprobada',
    read: false,
    createdAt: hoursAgo(1),
    link: '/proposals',
  },
  {
    id: 'notif-002',
    type: 'proposal_pending',
    title: 'Nueva propuesta pendiente',
    message: 'Hay una nueva propuesta de CDI pendiente de revisión',
    read: false,
    createdAt: hoursAgo(3),
    link: '/proposals',
  },
  {
    id: 'notif-003',
    type: 'class_modified',
    title: 'Clase modificada',
    message: 'La clase de PRG del 24/03 ha sido modificada',
    read: false,
    createdAt: hoursAgo(5),
  },
  {
    id: 'notif-006',
    type: 'proposal_pending',
    title: 'Nueva propuesta pendiente',
    message: 'Hay una nueva propuesta de SO pendiente de revisión',
    read: false,
    createdAt: daysAgo(2),
    link: '/proposals',
  },
  {
    id: 'notif-009',
    type: 'class_modified',
    title: 'Clase modificada',
    message: 'La clase de ALB del 14/04 ha sido cancelada',
    read: false,
    createdAt: daysAgo(1),
  },

  // ── Read ─────────────────────────────────────────────────────────────────────
  {
    id: 'notif-004',
    type: 'proposal_rejected',
    title: 'Propuesta rechazada',
    message: 'Tu propuesta de cambio en GEO ha sido rechazada',
    read: true,
    createdAt: daysAgo(1),
    link: '/proposals',
  },
  {
    id: 'notif-005',
    type: 'proposal_approved',
    title: 'Propuesta aprobada',
    message: 'Tu propuesta de cambio en BDA ha sido aprobada',
    read: true,
    createdAt: daysAgo(2),
    link: '/proposals',
  },
  {
    id: 'notif-007',
    type: 'class_modified',
    title: 'Clase modificada',
    message: 'La clase de EST del 26/03 ha cambiado de aula',
    read: true,
    createdAt: daysAgo(4),
  },
  {
    id: 'notif-008',
    type: 'proposal_rejected',
    title: 'Propuesta rechazada',
    message: 'Tu propuesta de cambio en IA ha sido rechazada',
    read: true,
    createdAt: daysAgo(5),
    link: '/proposals',
  },
];
