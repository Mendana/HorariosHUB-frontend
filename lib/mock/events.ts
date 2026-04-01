import type { UserEvent } from '@/lib/types/events';

// Today reference: 2026-04-01 (Wednesday)
// Current week:  Mon 2026-03-30 – Fri 2026-04-03
// Next week:     Mon 2026-04-06 – Fri 2026-04-10
// Week +2:       Mon 2026-04-13 – Fri 2026-04-17

export const MOCK_EVENTS: UserEvent[] = [
  // ── Current week ────────────────────────────────────────────────────────────
  {
    id: 'ev-001',
    title: 'Entrega Práctica 2 ALG',
    description: 'Subir al Campus Virtual antes de las 10:00',
    date: '2026-04-01',
    time: '10:00',
    type: 'delivery',
  },
  {
    id: 'ev-002',
    title: 'Límite informe CDI',
    description: 'Informe del experimento numérico, mín. 4 páginas',
    date: '2026-04-03',
    time: '23:30',
    type: 'deadline',
  },
  {
    id: 'ev-003',
    title: 'Revisar apuntes PRG',
    date: '2026-03-31',
    time: '09:00',
    type: 'reminder',
  },
  {
    id: 'ev-004',
    title: 'Reunión grupo de estudio',
    description: 'Sala B-204, preparar examen parcial SO',
    date: '2026-04-02',
    time: '16:00',
    type: 'other',
  },

  // ── Next week ────────────────────────────────────────────────────────────────
  {
    id: 'ev-005',
    title: 'Entrega Práctica 3 PRG',
    description: 'Implementación del árbol AVL con tests unitarios',
    date: '2026-04-07',
    time: '11:00',
    type: 'delivery',
  },
  {
    id: 'ev-006',
    title: 'Tutoría Dr. García',
    date: '2026-04-08',
    time: '16:30',
    type: 'reminder',
  },
  {
    id: 'ev-007',
    title: 'Fecha límite proyecto BDA',
    date: '2026-04-10',
    time: '18:00',
    type: 'deadline',
  },

  // ── Week +2 ──────────────────────────────────────────────────────────────────
  {
    id: 'ev-008',
    title: 'Memoria proyecto final',
    description: 'Entregar PDF en secretaría y subir al repositorio del grupo',
    date: '2026-04-14',
    time: '09:00',
    type: 'delivery',
  },
];
