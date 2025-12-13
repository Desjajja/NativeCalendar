export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const DAYS_IN_WEEK = 7;
const WEEKS_IN_CALENDAR = 6;

export const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const isSameDay = (a: Date, b: Date): boolean => startOfDay(a).getTime() === startOfDay(b).getTime();

export const addDays = (date: Date, amount: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

export const toDateKey = (date: Date): string => {
  const normalized = startOfDay(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fromDateKey = (dateKey: string): Date => {
  const [yearString, monthString, dayString] = dateKey.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  return new Date(year, month - 1, day);
};

export const generateCalendar = (year: number, month: number): CalendarDay[][] => {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const weeks: CalendarDay[][] = [];
  const cursor = new Date(gridStart);

  for (let week = 0; week < WEEKS_IN_CALENDAR; week += 1) {
    const days: CalendarDay[] = [];

    for (let day = 0; day < DAYS_IN_WEEK; day += 1) {
      const cellDate = new Date(cursor);
      days.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push(days);
  }

  return weeks;
};
