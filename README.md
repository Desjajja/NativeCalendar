# Minimal Calendar (Expo + TypeScript)

A minimal calendar app built with Expo Router, featuring:
- Monthly grid calendar with selectable dates
- Anniversary CRUD (all-day or timed range)
- Anniversary import/export as `.ics` via ical.js
- “Events” tab grouping by dates that have anniversaries

## Run

```bash
npm install
npx expo start
```

## Usage

### Calendar tab (日历)

- Tap a date to select it.
- Long-press a date to open the anniversary editor directly.
- Top-right actions:
  - Download icon: import anniversaries from an `.ics` file
  - Upload icon: export anniversaries to an `.ics` file (share sheet)
  - Plus icon: create/edit the anniversary for the selected date

### Anniversary modal (纪念日)

- Title is required, note is optional.
- One date can contain multiple anniversaries.
- Time mode:
  - `全天` and `时间段` are mutually exclusive.
  - Switching to `全天` clears and disables the time fields.

### Events tab (事件)

- Shows only future dates (>= today) that have anniversaries.
- Each date expands to show all events on that day (name / note / time or all-day).

## Notes

- Safe area handling uses `react-native-safe-area-context` and requires a root `SafeAreaProvider` (`app/_layout.tsx`).
- File IO uses `expo-file-system/legacy` for best Expo Go compatibility.
- iOS simulator share sheet behavior can differ from real devices; exported files are still saved to the app directory and the UI will show the file path if sharing fails.

## Key Files

- `app/_layout.tsx` providers and navigation stack
- `components/screens/calendar-screen.tsx` calendar screen + import/export actions
- `components/screens/events-screen.tsx` events list screen (only dates with events)
- `components/screens/anniversary-modal-screen.tsx` anniversary editor modal
- `utils/icalUtils.ts` ICS parse/export (ical.js)
- `utils/calendarUtils.ts` calendar grid + date helpers
