import React from 'react';

import { startOfDay, toDateKey } from '@/utils/calendarUtils';
import { CalendarEvent } from '@/utils/icalUtils';

type AnniversaryInput = {
  summary: string;
  description?: string;
};

type CalendarEventsContextValue = {
  events: CalendarEvent[];
  /**
   * Create or replace the anniversary for a given calendar date.
   * We use "one anniversary per day" to keep the UI minimal.
   */
  upsertAnniversary: (date: Date, input: AnniversaryInput) => void;
  deleteAnniversary: (date: Date) => void;
  /**
   * Merge anniversaries imported from ICS, deduping by date.
   */
  mergeAnniversaries: (anniversaries: CalendarEvent[]) => void;
};

const CalendarEventsContext = React.createContext<CalendarEventsContextValue | undefined>(undefined);

const byStartAsc = (a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime();

const normalizeAnniversary = (date: Date, input: AnniversaryInput): CalendarEvent => {
  const normalizedDate = startOfDay(date);
  const dateKey = toDateKey(normalizedDate);

  return {
    // Stable, human-readable id to avoid list key collisions across imports.
    id: `anniversary-${dateKey}`,
    summary: input.summary.trim(),
    start: normalizedDate,
    description: input.description?.trim() ? input.description.trim() : undefined,
    type: 'anniversary',
  };
};

export function CalendarEventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);

  const upsertAnniversary = React.useCallback((date: Date, input: AnniversaryInput) => {
    const next = normalizeAnniversary(date, input);
    const dateKey = toDateKey(next.start);

    setEvents((prev) => {
      const kept = prev.filter(
        (event) => !(event.type === 'anniversary' && toDateKey(startOfDay(event.start)) === dateKey)
      );
      return [...kept, next].sort(byStartAsc);
    });
  }, []);

  const deleteAnniversary = React.useCallback((date: Date) => {
    const dateKey = toDateKey(startOfDay(date));
    setEvents((prev) =>
      prev.filter((event) => !(event.type === 'anniversary' && toDateKey(startOfDay(event.start)) === dateKey))
    );
  }, []);

  const mergeAnniversaries = React.useCallback((anniversaries: CalendarEvent[]) => {
    setEvents((prev) => {
      const nextAnniversaries = new Map<string, CalendarEvent>();

      prev
        .filter((event) => event.type === 'anniversary')
        .forEach((event) => {
          const dateKey = toDateKey(startOfDay(event.start));
          nextAnniversaries.set(dateKey, { ...event, id: `anniversary-${dateKey}`, type: 'anniversary' });
        });

      anniversaries.forEach((event) => {
        if (event.type !== 'anniversary') return;
        const dateKey = toDateKey(startOfDay(event.start));
        nextAnniversaries.set(dateKey, {
          ...event,
          id: `anniversary-${dateKey}`,
          start: startOfDay(event.start),
          type: 'anniversary',
        });
      });

      const nonAnniversaries = prev.filter((event) => event.type !== 'anniversary');
      return [...nonAnniversaries, ...Array.from(nextAnniversaries.values())].sort(byStartAsc);
    });
  }, []);

  const value = React.useMemo(
    () => ({ events, upsertAnniversary, deleteAnniversary, mergeAnniversaries }),
    [events, upsertAnniversary, deleteAnniversary, mergeAnniversaries]
  );

  return <CalendarEventsContext.Provider value={value}>{children}</CalendarEventsContext.Provider>;
}

export function useCalendarEvents() {
  const value = React.useContext(CalendarEventsContext);
  if (!value) throw new Error('useCalendarEvents must be used within CalendarEventsProvider');
  return value;
}
