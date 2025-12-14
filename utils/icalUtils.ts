/**
 * iCalendar (ICS) parse/export helpers.
 *
 * Note: ical.js is a default export in Metro/RN builds, so we import it as `ICAL`.
 */
import ICAL from 'ical.js';

import { addDays, startOfDay } from '@/utils/calendarUtils';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end?: Date;
  location?: string;
  description?: string;
  /**
   * `anniversary` is treated as an all-day event (DATE value in iCalendar).
   * Regular timed events use DATE-TIME.
   */
  type?: 'event' | 'anniversary';
  /**
   * When `true`, the event is an all-day item. For anniversaries, this controls
   * whether DTSTART/DTEND are exported as DATE vs DATE-TIME.
   */
  allDay?: boolean;
  /**
   * Local reminder configuration (not exported to ICS).
   */
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  /**
   * Scheduled notification id returned by expo-notifications.
   */
  notificationId?: string;
}

const toDate = (icalTime: ICAL.Time): Date => new Date(icalTime.toJSDate());

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const isAnniversaryComponent = (vevent: ICAL.Component): boolean => {
  const xType = normalizeText(vevent.getFirstPropertyValue('x-minical-type'));
  if (xType?.toUpperCase() === 'ANNIVERSARY') return true;

  const categories = normalizeText(vevent.getFirstPropertyValue('categories'));
  if (!categories) return false;
  return categories
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .includes('ANNIVERSARY');
};

export const parseIcs = (icsString: string): CalendarEvent[] => {
  try {
    const jcalData = ICAL.parse(icsString);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    return vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      // When DTSTART/DTEND are DATE (no time), ical.js marks `isDate = true`.
      const isAllDay = !!event.startDate?.isDate;
      const isAnniversary = isAllDay || isAnniversaryComponent(vevent);

      return {
        id: event.uid || Math.random().toString(36),
        summary: event.summary || 'Untitled Event',
        start: toDate(event.startDate),
        end: event.endDate ? toDate(event.endDate) : undefined,
        location: event.location || undefined,
        description: event.description || undefined,
        type: isAnniversary ? 'anniversary' : 'event',
        allDay: isAllDay,
      };
    });
  } catch (error) {
    console.warn('Failed to parse ICS', error);
    return [];
  }
};

export const exportEventsToIcs = (events: CalendarEvent[]): string => {
  const vcalendar = new ICAL.Component(['vcalendar', [], []]);
  vcalendar.updatePropertyWithValue('prodid', '-//Minimal Calendar//iCal Export//EN');
  vcalendar.updatePropertyWithValue('version', '2.0');

  events.forEach((item) => {
    const isAnniversary = item.type === 'anniversary';
    const isAllDay = item.allDay ?? isAnniversary;
    const vevent = new ICAL.Component('vevent');
    vevent.updatePropertyWithValue('uid', item.id || Math.random().toString(36));
    vevent.updatePropertyWithValue('summary', item.summary);
    const startDate = isAllDay ? startOfDay(item.start) : item.start;
    const start = ICAL.Time.fromJSDate(startDate);
    if (isAllDay) {
      start.isDate = true;
    }
    vevent.updatePropertyWithValue('dtstart', start);

    /**
     * RFC 5545: for all-day events, DTEND is exclusive. If no end is provided, we export
     * a 1-day duration by setting DTEND = DTSTART + 1 day.
     */
    const endDate = item.end
      ? isAllDay
        ? startOfDay(item.end)
        : item.end
      : isAllDay
        ? addDays(startDate, 1)
        : undefined;
    if (endDate) {
      const end = ICAL.Time.fromJSDate(endDate);
      if (isAllDay) end.isDate = true;
      vevent.updatePropertyWithValue('dtend', end);
    }

    if (item.location) {
      vevent.updatePropertyWithValue('location', item.location);
    }

    if (item.description) {
      vevent.updatePropertyWithValue('description', item.description);
    }

    if (isAllDay) {
      vevent.updatePropertyWithValue('transp', 'TRANSPARENT');
    }

    if (isAnniversary) {
      // Tag to make timed anniversaries importable as anniversaries.
      vevent.updatePropertyWithValue('categories', 'ANNIVERSARY');
      vevent.updatePropertyWithValue('x-minical-type', 'ANNIVERSARY');
    }

    vcalendar.addSubcomponent(vevent);
  });

  return vcalendar.toString();
};
