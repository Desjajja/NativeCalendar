This document is the working spec and conventions for the Minimal Calendar app (React Native + TypeScript + Expo + Expo Router), including iCalendar (ICS) import/export via ical.js.

## Project Overview

A minimal, educational-grade cross-platform calendar app that:
- Shows a monthly grid calendar.
- Supports selecting a date to view items for that day.
- Supports creating/editing/deleting multiple “anniversaries” per day (all‑day or timed range).
- Supports importing/exporting anniversaries as `.ics` (iCalendar) files.
- Provides a second tab that groups by dates that have anniversaries.

No backend. All logic is client-side.

## Project Structure (current)

```plain text
MyCalendarApp/
├── app/                           # Expo Router routes
│   ├── _layout.tsx                # Providers + stack
│   ├── modal.tsx                  # Anniversary editor modal
│   └── (tabs)/
│       ├── _layout.tsx            # Tabs: 日历 / 事件
│       ├── index.tsx              # Calendar screen entry
│       └── events.tsx             # Events screen entry
├── components/
│   ├── Calendar.tsx               # Re-export of month calendar component
│   ├── calendar/                  # Calendar UI implementation
│   ├── screens/                   # Screen components (calendar/events/modal)
│   ├── themed-text.tsx            # Theme-aware text
│   ├── themed-view.tsx            # Theme-aware view
│   └── ui/                        # UI primitives (icon buttons, symbols)
├── context/
│   └── calendar-events-context.tsx # In-memory events store
└── utils/
    ├── calendarUtils.ts           # Date math + keys
    ├── colorUtils.ts              # Small styling helpers
    └── icalUtils.ts               # ICS parse/export via ical.js
```

## Core Dependencies

- `ical.js`: parse/generate iCalendar (RFC 5545).
- `expo-document-picker`: user selects `.ics` file.
- `expo-file-system/legacy`: read/write ICS files in Expo Go reliably.
- `expo-sharing`: share exported ICS via system sheet.
- `react-native-safe-area-context`: safe area insets (requires `SafeAreaProvider` at root).

## Data Model

`utils/icalUtils.ts`:
```ts
export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end?: Date;
  description?: string;
  type?: 'event' | 'anniversary';
}
```

Conventions:
- `type: 'anniversary'` can be all-day (DATE) or timed (DATE-TIME); see `allDay`.
- Export tags anniversaries with `CATEGORIES:ANNIVERSARY` and `X-MINICAL-TYPE:ANNIVERSARY` so timed anniversaries can round-trip via ICS.

## Key Flows

- Calendar tab (`components/screens/calendar-screen.tsx`)
  - Tap a date to select.
  - Long-press a date to open the editor modal.
  - Header actions: import anniversaries, export anniversaries, add/edit anniversary (modal).
- Modal (`components/screens/anniversary-modal-screen.tsx`)
  - List all anniversaries for the date; select to edit; create new; delete.
  - Time mode is mutually exclusive: all-day vs start/end time.
- Events tab (`components/screens/events-screen.tsx`)
  - Renders only dates that have anniversaries; shows all events for that date.

## Engineering Guidelines

- Keep utilities pure (`utils/`), keep side-effects in screens/components.
- Prefer small, readable files; add short “why” comments near tricky logic (ICS all-day DTEND, safe area provider, dedup rules).
- Avoid adding new dependencies unless necessary.
