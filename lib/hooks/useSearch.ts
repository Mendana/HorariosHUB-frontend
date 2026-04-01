'use client';

/**
 * useSearch — búsqueda global sobre los subjects en memoria.
 *
 * El hook y la barra de búsqueda viven en Topbar (layout), pero los subjects
 * se cargan en page.tsx (subtree distinto). Un store de módulo compartido
 * actúa de puente sin necesitar React context ni modificar layout.tsx:
 *
 *   page.tsx  →  setSearchSubjects(subjects)     (escribe en el store)
 *   page.tsx  →  registerSearchNavigate(fn)       (registra el handler de nav)
 *   Topbar    →  useSearch()                      (lee del store)
 *   Topbar    →  triggerSearchNavigate(result)    (dispara el handler)
 */

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import type { Subject } from '@/lib/types/schedule';
import { getISOWeekFromDate } from '@/lib/utils/scheduleHelpers';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface SearchResult {
  subject: Subject;
  isoYear: number;
  isoWeek: number;
}

// ─── Store de módulo: subjects ────────────────────────────────────────────────

let _subjects: Subject[] = [];
const _subjectListeners = new Set<() => void>();

/** Llamar desde page.tsx cuando cambian los subjects cargados. */
export function setSearchSubjects(subjects: Subject[]): void {
  _subjects = subjects;
  _subjectListeners.forEach((fn) => fn());
}

function _subscribeSubjects(fn: () => void): () => void {
  _subjectListeners.add(fn);
  return () => _subjectListeners.delete(fn);
}

// ─── Store de módulo: callback de navegación ─────────────────────────────────

type NavigateCallback = (result: SearchResult) => void;
let _navigateCb: NavigateCallback | null = null;

/**
 * Registra la función que ejecuta la navegación al resultado.
 * Llamar desde page.tsx dentro de un useEffect.
 * Devuelve la función de limpieza.
 */
export function registerSearchNavigate(fn: NavigateCallback): () => void {
  _navigateCb = fn;
  return () => { if (_navigateCb === fn) _navigateCb = null; };
}

/** Invocado por SearchBar al seleccionar un resultado. */
export function triggerSearchNavigate(result: SearchResult): void {
  _navigateCb?.(result);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Referencia estable para el server snapshot — evita el loop de useSyncExternalStore
const EMPTY_SUBJECTS: Subject[] = [];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSearch() {
  const subjects = useSyncExternalStore(
    _subscribeSubjects,
    () => _subjects,
    () => EMPTY_SUBJECTS,
  );

  const [query, setQuery]               = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen]             = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce 150 ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const results = useMemo((): SearchResult[] => {
    const q = debouncedQuery.trim();
    if (q.length < 2) return [];
    const norm = normalize(q);

    const matched = subjects.filter((s) =>
      normalize(s.name).includes(norm) ||
      normalize(s.type).includes(norm) ||
      normalize(s.classroom).includes(norm),
    );

    const sorted = [...matched].sort((a, b) => {
      const da = new Date(a.date.year, a.date.month - 1, a.date.day).getTime();
      const db = new Date(b.date.year, b.date.month - 1, b.date.day).getTime();
      return da - db;
    });

    return sorted.slice(0, 8).map((s) => {
      const { year, week } = getISOWeekFromDate(
        new Date(s.date.year, s.date.month - 1, s.date.day),
      );
      return { subject: s, isoYear: year, isoWeek: week };
    });
  }, [subjects, debouncedQuery]);

  function clearSearch() {
    setQuery('');
    setDebouncedQuery('');
  }

  return { query, setQuery, results, isOpen, setIsOpen, clearSearch };
}
