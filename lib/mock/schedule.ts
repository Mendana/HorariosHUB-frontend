import type { Subject } from '../types/schedule';

/**
 * Mock data — week of 2026-03-23 (ISO week 13).
 * Contains 5 days, mixed types, and a deliberate overlap on Tuesday.
 */
export const MOCK_SUBJECTS: Subject[] = [
  // ── Monday Mar 23 ─────────────────────────────────────────
  {
    id: 'm1',
    name: 'ALG',
    type: 'Teoría',
    classroom: 'Aula A01',
    date: { year: 2026, month: 3, day: 23 },
    startTime: '09:00',
    endTime: '11:00',
  },
  {
    id: 'm2',
    name: 'CDI',
    type: 'Práctica',
    classroom: 'Lab 203',
    date: { year: 2026, month: 3, day: 23 },
    startTime: '11:30',
    endTime: '13:30',
  },
  {
    id: 'm3',
    name: 'PRG',
    type: 'Teoría',
    classroom: 'Aula B02',
    date: { year: 2026, month: 3, day: 23 },
    startTime: '15:00',
    endTime: '17:00',
  },

  // ── Tuesday Mar 24 ────────────────────────────────────────
  // Overlap: FIS (09:00–11:00) y GEO (09:00–10:30) — mismo horario
  {
    id: 't1',
    name: 'FIS',
    type: 'Teoría',
    classroom: 'Aula A01',
    date: { year: 2026, month: 3, day: 24 },
    startTime: '09:00',
    endTime: '11:00',
  },
  {
    id: 't2',
    name: 'GEO',
    type: 'Teoría',
    classroom: 'Aula C03',
    date: { year: 2026, month: 3, day: 24 },
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    id: 't3',
    name: 'EDC',
    type: 'Práctica',
    classroom: 'Lab 101',
    date: { year: 2026, month: 3, day: 24 },
    startTime: '12:00',
    endTime: '14:00',
  },

  // ── Wednesday Mar 25 ──────────────────────────────────────
  {
    id: 'w1',
    name: 'MAT',
    type: 'Teoría',
    classroom: 'Aula A02',
    date: { year: 2026, month: 3, day: 25 },
    startTime: '10:00',
    endTime: '12:00',
  },
  {
    id: 'w2',
    name: 'ALG',
    type: 'Práctica',
    classroom: 'Lab 201',
    date: { year: 2026, month: 3, day: 25 },
    startTime: '15:30',
    endTime: '17:30',
  },

  // ── Thursday Mar 26 ───────────────────────────────────────
  {
    id: 'h1',
    name: 'CDI',
    type: 'Teoría',
    classroom: 'Aula A01',
    date: { year: 2026, month: 3, day: 26 },
    startTime: '09:00',
    endTime: '11:00',
  },
  {
    id: 'h2',
    name: 'PRG',
    type: 'Examen',
    classroom: 'Aula E01',
    date: { year: 2026, month: 3, day: 26 },
    startTime: '11:30',
    endTime: '13:30',
  },
  {
    id: 'h3',
    name: 'FIS',
    type: 'Práctica',
    classroom: 'Lab FIS',
    date: { year: 2026, month: 3, day: 26 },
    startTime: '16:00',
    endTime: '18:00',
  },

  // ── Friday Mar 27 ─────────────────────────────────────────
  {
    id: 'f1',
    name: 'MAT',
    type: 'Teoría',
    classroom: 'Aula A01',
    date: { year: 2026, month: 3, day: 27 },
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    id: 'f2',
    name: 'GEO',
    type: 'Práctica',
    classroom: 'Lab 101',
    date: { year: 2026, month: 3, day: 27 },
    startTime: '12:00',
    endTime: '14:00',
  },
  {
    id: 'f3',
    name: 'EDC',
    type: 'Teoría',
    classroom: 'Aula B01',
    date: { year: 2026, month: 3, day: 27 },
    startTime: '16:30',
    endTime: '18:30',
  },
];
