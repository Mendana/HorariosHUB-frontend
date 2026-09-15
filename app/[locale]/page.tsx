'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getCurrentWeek, getWeekDates, getISOWeekFromDate, todayIsoDate } from '@/lib/utils/scheduleHelpers';
import { useSchedule, ScheduleRefreshContext } from '@/lib/hooks/useSchedule';
import { useScheduleMonth } from '@/lib/hooks/useScheduleMonth';
import { useEvents } from '@/lib/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { ScheduleSearch } from '@/components/schedule/ScheduleSearch';
import { WeekNavigator, type ScheduleViewMode } from '@/components/schedule/WeekNavigator';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { DayGrid } from '@/components/schedule/DayGrid';
import { MonthGrid } from '@/components/schedule/MonthGrid';
import { ImportBanner } from '@/components/schedule/ImportBanner';
import { NextClassBanner } from '@/components/schedule/NextClassBanner';
import { ShareModal } from '@/components/schedule/ShareModal';
import { EventForm } from '@/components/events/EventForm';
import { ClassForm } from '@/components/classes/ClassForm';
import type { UserEvent, NewEventData } from '@/lib/types/events';
import type { Class, ClassInput } from '@/lib/types/classes';
import { useSearchParams } from 'next/navigation';
import { WelcomeModal } from '@/components/modal/WelcomeModal';

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const uo = searchParams.get('uo')?.toLowerCase() ?? null;
  const shouldImport = searchParams.get('import') === 'true';

  const [identifier, setIdentifier] = useState<string | null>(uo);
  const [importUo, setImportUo]     = useState<string | null>(shouldImport && uo ? uo : null);
  const [shareOpen, setShareOpen]   = useState(false);

  const initial = getCurrentWeek();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedWeek, setSelectedWeek] = useState(initial.week);

  const [scheduleView, setScheduleView] = useState<ScheduleViewMode>('week');

  const now = new Date();
  const [viewMonthYear, setViewMonthYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewDay, setViewDay] = useState(() => todayIsoDate());

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const { user } = useAuth();
  const canCreate = user?.role === 'professor' || user?.role === 'admin';

  useEffect(() => {
    if (user && !identifier) setIdentifier(user.email);
  }, [user]);

  function handleIdentifierChange(id: string) {
    setIdentifier(id);
  }

  // ── Class creation via cell click ─────────────────────────────────────────────
  const [ghostCell, setGhostCell]       = useState<{ date: string; time: string } | null>(null);
  const [classFormCell, setClassFormCell] = useState<{ date: string; time: string } | null>(null);
  const [creationHintVisible, setCreationHintVisible] = useState(true);



  useEffect(() => {
    const check = async () => {
      if (localStorage.getItem('hasCreatedByClick') === 'true') {
        setCreationHintVisible(false);
      }
    };
    check();
  }, []);

  const handleCellClick = useCallback((date: string, time: string) => {
    setGhostCell({ date, time });
    setTimeout(() => setClassFormCell({ date, time }), 150);
  }, []);

  function handleClassFormClose() {
    setClassFormCell(null);
    setGhostCell(null);
  }

  async function handleClassCreate(_input: ClassInput) {
    // In production: await apiFetch('/api/classes', { method: 'POST', body: _input })
    setClassFormCell(null);
    setGhostCell(null);
    refreshSchedule();
    localStorage.setItem('hasCreatedByClick', 'true');
    setCreationHintVisible(false);
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  const {
    events,
    eventsVisible,
    toggleVisibility: toggleEventsVisibility,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  // EventForm state: null = closed, undefined initial = create, defined = edit
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit]     = useState<UserEvent | undefined>(undefined);

  function openCreateEvent() {
    setEventToEdit(undefined);
    setEventFormOpen(true);
  }

  function openEditEvent(event: UserEvent) {
    setEventToEdit(event);
    setEventFormOpen(true);
  }

  async function handleEventSubmit(data: NewEventData) {
    if (eventToEdit) {
      await updateEvent(eventToEdit.id, data);
    } else {
      await createEvent(data);
    }
  }

  async function handleDeleteEvent(id: string) {
    await deleteEvent(id);
  }

  // Rehydrate view preference from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('scheduleView');
    if (stored === 'day' || stored === 'week' || stored === 'month') {
      setScheduleView(stored);
    }
  }, []);

  // Day view browses a different date than the week grid; derive which ISO week
  // it falls in so we can reuse the same weekly fetch (avoids a second network
  // call for what's ultimately the same data source).
  const dayWeekInfo = useMemo(() => {
    const [y, m, d] = viewDay.split('-').map(Number);
    return getISOWeekFromDate(new Date(Date.UTC(y, m - 1, d)));
  }, [viewDay]);

  const activeWeekYear = scheduleView === 'day' ? dayWeekInfo.year : selectedYear;
  const activeWeekNum  = scheduleView === 'day' ? dayWeekInfo.week : selectedWeek;
  const weekDates = getWeekDates(activeWeekYear, activeWeekNum);
  const weekStart = weekDates[0].toISOString();

  const { subjects, isLoading, refreshSchedule } = useSchedule(
    identifier,
    weekStart,
    scheduleView !== 'month',
  );

  const monthParam = `${viewMonthYear}-${String(viewMonth).padStart(2, '0')}`;
  const { subjects: monthSubjects, isLoading: monthIsLoading } = useScheduleMonth(
    identifier,
    monthParam,
    scheduleView === 'month',
  );

  const handleWeekChange = (year: number, week: number) => {
    setSelectedYear(year);
    setSelectedWeek(week);
  };

  const handleViewChange = (view: ScheduleViewMode) => {
    if (view !== scheduleView) {
      if (view === 'day') {
        // Day view always opens on today — arrows/swipe move from there.
        setViewDay(todayIsoDate());
      } else if (scheduleView === 'day') {
        const [y, m, d] = viewDay.split('-').map(Number);
        const dayDate = new Date(Date.UTC(y, m - 1, d));
        if (view === 'week') {
          const { year: wy, week: wk } = getISOWeekFromDate(dayDate);
          setSelectedYear(wy);
          setSelectedWeek(wk);
          localStorage.setItem('selectedWeekYear', JSON.stringify(wy));
          localStorage.setItem('selectedWeek', JSON.stringify(wk));
        } else if (view === 'month') {
          setViewMonthYear(y);
          setViewMonth(m);
        }
      } else if (view === 'month' && scheduleView === 'week') {
        const monday = getWeekDates(selectedYear, selectedWeek)[0];
        setViewMonthYear(monday.getUTCFullYear());
        setViewMonth(monday.getUTCMonth() + 1);
      } else if (view === 'week' && scheduleView === 'month') {
        const firstDay = new Date(Date.UTC(viewMonthYear, viewMonth - 1, 1));
        const { year: wy, week: wk } = getISOWeekFromDate(firstDay);
        setSelectedYear(wy);
        setSelectedWeek(wk);
        localStorage.setItem('selectedWeekYear', JSON.stringify(wy));
        localStorage.setItem('selectedWeek', JSON.stringify(wk));
      }
    }
    setScheduleView(view);
    localStorage.setItem('scheduleView', view);
  };

  const handleMonthChange =(year: number, month: number) => {
    setViewMonthYear(year);
    setViewMonth(month);
  };

  const handleGoToWeek =(isoYear: number, isoWeek: number) => {
    setSelectedYear(isoYear);
    setSelectedWeek(isoWeek);
    localStorage.setItem('selectedWeekYear', JSON.stringify(isoYear));
    localStorage.setItem('selectedWeek', JSON.stringify(isoWeek));
    setScheduleView('week');
    localStorage.setItem('scheduleView', 'week');
  };

  // Only load events for authenticated users
  const effectiveEvents = user ? events : [];

  // MODALS
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWelcomeModal');
    if (!seen) {
      setWelcomeModalOpen(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setWelcomeModalOpen(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  }

  return (
    <ScheduleRefreshContext.Provider value={refreshSchedule}>
      {/* Import banner — full-width, between topbar and search */}
      {importUo && (
        <ImportBanner uo={importUo} onDismiss={() => setImportUo(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ScheduleSearch
          identifier={identifier}
          onIdentifierChange={handleIdentifierChange}
          onShareClick={() => setShareOpen(true)}
          onCreateEvent={openCreateEvent}
          showCreationHint={canCreate && creationHintVisible && (scheduleView === 'week' || scheduleView === 'day')}
        />
        <WeekNavigator
          year={selectedYear}
          week={selectedWeek}
          onWeekChange={handleWeekChange}
          view={scheduleView}
          onViewChange={handleViewChange}
          eventsVisible={eventsVisible}
          onToggleEvents={toggleEventsVisibility}
        />
        {identifier !== null && (
          <NextClassBanner
            subjects={subjects}
            isCurrentPeriod={
              scheduleView === 'day'
                ? viewDay === todayIsoDate()
                : selectedYear === initial.year && selectedWeek === initial.week
            }
            scheduleView={scheduleView}
          />
        )}
        {scheduleView === 'day' ? (
          <DayGrid
            date={viewDay}
            onDateChange={setViewDay}
            subjects={subjects}
            isLoading={isLoading}
            hasIdentifier={identifier !== null}
            events={effectiveEvents}
            eventsVisible={eventsVisible}
            onEditEvent={openEditEvent}
            onDeleteEvent={handleDeleteEvent}
            canCreate={canCreate}
            onCellClick={handleCellClick}
            ghostCell={ghostCell}
          />
        ) : scheduleView === 'week' ? (
          <ScheduleGrid
            subjects={subjects}
            isLoading={isLoading}
            year={selectedYear}
            week={selectedWeek}
            hasIdentifier={identifier !== null}
            onWeekChange={handleWeekChange}
            events={effectiveEvents}
            eventsVisible={eventsVisible}
            onEditEvent={openEditEvent}
            onDeleteEvent={handleDeleteEvent}
            canCreate={canCreate}
            onCellClick={handleCellClick}
            ghostCell={ghostCell}
          />
        ) : (
          <MonthGrid
            subjects={monthSubjects}
            isLoading={monthIsLoading}
            year={viewMonthYear}
            month={viewMonth}
            onMonthChange={handleMonthChange}
            onGoToWeek={handleGoToWeek}
            events={effectiveEvents}
            eventsVisible={eventsVisible}
          />
        )}
      </div>

      {/* Share modal */}
      {welcomeModalOpen && (
        <WelcomeModal onClose={handleCloseWelcomeModal} />
      )}

      {shareOpen && identifier && (
        <ShareModal identifier={identifier} onClose={() => setShareOpen(false)} />
      )}

      {/* Event create/edit modal */}
      {eventFormOpen && (
        <EventForm
          initial={eventToEdit}
          onSubmit={handleEventSubmit}
          onClose={() => setEventFormOpen(false)}
        />
      )}

      {/* Class create modal — opened via cell click (professor/admin) */}
      {classFormCell && (() => {
        const [y, m, d] = classFormCell.date.split('-').map(Number);
        const prefill: Class = {
          id: '',
          name: '',
          date: { year: y, month: m, day: d },
          startTime: classFormCell.time,
          endTime: classFormCell.time,
          durationMinutes: 60,
        };
        return (
          <ClassForm
            initial={prefill}
            onSubmit={handleClassCreate}
            onClose={handleClassFormClose}
          />
        );
      })()}
    </ScheduleRefreshContext.Provider>
  );
}
