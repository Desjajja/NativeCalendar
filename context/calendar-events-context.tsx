import React from 'react';

import { startOfDay } from '@/utils/calendarUtils';
import { CalendarEvent } from '@/utils/icalUtils';

type AnniversaryInput = {
  summary: string;
  description?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
};

type CalendarEventsContextValue = {
  events: CalendarEvent[];
  upsertAnniversary: (input: { id?: string; date: Date } & AnniversaryInput) => void;
  deleteEvent: (id: string) => void;
  /**
   * Merge anniversaries imported from ICS, deduping by UID (`event.id`).
   */
  mergeAnniversaries: (anniversaries: CalendarEvent[]) => void;
};

const CalendarEventsContext = React.createContext<CalendarEventsContextValue | undefined>(undefined);

const byStartAsc = (a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime();

const generateId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const parseTime = (value: string): { hours: number; minutes: number } | null => {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
};

export function CalendarEventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);

  const upsertAnniversary = React.useCallback((input: { id?: string; date: Date } & AnniversaryInput) => {
    const date = startOfDay(input.date);
    const id = input.id ?? `anniversary-${generateId()}`;

    const summary = input.summary.trim();
    const description = input.description?.trim() ? input.description.trim() : undefined;

    const base: CalendarEvent = {
      id,
      summary,
      description,
      type: 'anniversary',
      allDay: input.allDay,
      start: date,
    };

    let start = date;
    let end: Date | undefined;

    if (!input.allDay) {
      const startParts = input.startTime ? parseTime(input.startTime) : null;
      const endParts = input.endTime ? parseTime(input.endTime) : null;

      if (startParts) {
        start = new Date(date);
        start.setHours(startParts.hours, startParts.minutes, 0, 0);
      }

      if (endParts) {
        end = new Date(date);
        end.setHours(endParts.hours, endParts.minutes, 0, 0);
      }
    }

    const next: CalendarEvent = { ...base, start, end };

    setEvents((prev) => {
      const kept = prev.filter((event) => event.id !== id);
      return [...kept, next].sort(byStartAsc);
    });
  }, []);

  const deleteEvent = React.useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const mergeAnniversaries = React.useCallback((anniversaries: CalendarEvent[]) => {
    setEvents((prev) => {
      const byId = new Map<string, CalendarEvent>();
      prev.forEach((event) => byId.set(event.id, event));

      anniversaries.forEach((event) => {
        if (event.type !== 'anniversary') return;
        const id = event.id?.trim() ? event.id : `anniversary-${generateId()}`;
        byId.set(id, {
          ...event,
          id,
          start: event.allDay ? startOfDay(event.start) : event.start,
          type: 'anniversary',
        });
      });

      return Array.from(byId.values()).sort(byStartAsc);
    });
  }, []);

  const value = React.useMemo(
    () => ({ events, upsertAnniversary, deleteEvent, mergeAnniversaries }),
    [events, upsertAnniversary, deleteEvent, mergeAnniversaries]
  );

  return <CalendarEventsContext.Provider value={value}>{children}</CalendarEventsContext.Provider>;
}

export function useCalendarEvents() {
  const value = React.useContext(CalendarEventsContext);
  if (!value) throw new Error('useCalendarEvents must be used within CalendarEventsProvider');
  return value;
}
