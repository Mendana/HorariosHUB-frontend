'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/lib/hooks/useEvents';
import { EventList } from '@/components/events/EventList';
import { EventFilters } from '@/components/events/EventFilters';
import { EventForm } from '@/components/events/EventForm';
import { EventDeleteConfirm } from '@/components/events/EventDeleteConfirm';
import type { EventItem, EventInput, DisplayEvent } from '@/lib/types/events';

type Modal =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; event: EventItem }
  | { kind: 'delete'; event: EventItem };

const DEFAULT_PAGE_SIZE = 10;

function toDisplayEvent(ev: EventItem): DisplayEvent {
  const start = new Date(ev.startTime);
  const end = new Date(ev.endTime);
  const fmt = (d: Date) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return {
    id: ev.id,
    title: ev.title,
    description: ev.description,
    date: '',
    time: fmt(start),
    endTime: fmt(end),
    subject: ev.subject,
    groups: ev.groups,
    classroom: ev.classroom,
    isRecurring: !!ev.recurrence,
  };
}

export default function ManageEventsPage() {
  const t = useTranslations('events');
  const locale = useLocale();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user === null) {
      router.push('/auth/login');
    } else if (user.role !== 'professor' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const [modal, setModal] = useState<Modal>({ kind: 'none' });

  // Filter state
  const [search, setSearch]   = useState('');
  const [subject, setSubject] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('eventsPageSize')) || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  );

  const isProfOrAdmin = !!user && (user.role === 'professor' || user.role === 'admin');

  const { events, total, isLoading, error, refetch, createEvent, updateEvent, deleteEvent } = useEvents(
    { search, subject, page, limit: pageSize },
    isProfOrAdmin,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters = search !== '' || subject !== '';

  function handleSearchChange(v: string)  { setSearch(v);  setPage(1); }
  function handleSubjectChange(v: string) { setSubject(v); setPage(1); }
  function handleClearFilters()           { setSearch(''); setSubject(''); setPage(1); }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('eventsPageSize', String(size));
  }

  async function handleCreate(input: EventInput) {
    await createEvent(input);
    setModal({ kind: 'none' });
  }

  async function handleUpdate(id: string, input: EventInput) {
    await updateEvent(id, input);
    setModal({ kind: 'none' });
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    setModal({ kind: 'none' });
  }

  if (authLoading || user === null || (user.role !== 'professor' && user.role !== 'admin')) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      {/* Page header */}
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-primary leading-tight">{t('manageTitle')}</h1>
            <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('manageSubtitle')}</p>
          </div>
          <Button variant="primary" size="sm" iconLeft={Plus} onClick={() => setModal({ kind: 'create' })}>
            {t('newEvent')}
          </Button>
        </div>
      </div>

      <EventFilters
        search={search}
        subject={subject}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={handleSearchChange}
        onSubjectChange={handleSubjectChange}
        onClear={handleClearFilters}
      />

      {!isLoading && !error && (
        <p className="mb-2 text-xs text-tertiary">
          {total === 1 ? t('countFoundOne') : t('countFoundMany', { count: total })}
        </p>
      )}

      <EventList
        events={events}
        isLoading={isLoading}
        error={error}
        locale={locale}
        onEdit={(ev) => setModal({ kind: 'edit', event: ev })}
        onDelete={(ev) => setModal({ kind: 'delete', event: ev })}
        onRetry={refetch}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {modal.kind === 'create' && (
        <EventForm
          onSubmit={handleCreate}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}

      {modal.kind === 'edit' && (
        <EventForm
          initial={modal.event}
          onSubmit={(input) => handleUpdate(modal.event.id, input)}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}

      {modal.kind === 'delete' && (
        <EventDeleteConfirm
          event={toDisplayEvent(modal.event)}
          onConfirm={() => handleDelete(modal.event.id)}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
    </div>
  );
}
