import { addMonths, endOfWeek, format, getDaysInMonth, startOfWeek } from 'date-fns';

/** Israeli week: Sunday → Saturday */
export const WEEK_STARTS_ON = 0 as const;

export const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
] as const;

export const HEBREW_WEEKDAYS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] as const;

export function monthKeyOf(date: Date | number): string {
  return format(date, 'yyyy-MM');
}

export function dayKeyOf(date: Date | number): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-');
  return { year: Number(y), month: Number(m) - 1 };
}

export function monthKeyToDate(key: string): Date {
  const { year, month } = parseMonthKey(key);
  return new Date(year, month, 1);
}

export function shiftMonthKey(key: string, delta: number): string {
  return monthKeyOf(addMonths(monthKeyToDate(key), delta));
}

export function daysInMonthKey(key: string): number {
  return getDaysInMonth(monthKeyToDate(key));
}

export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${HEBREW_MONTHS[month] ?? ''} ${year}`;
}

export function monthNameOnly(key: string): string {
  return HEBREW_MONTHS[parseMonthKey(key).month] ?? '';
}

export function weekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function formatTime(ts: number): string {
  return format(ts, 'HH:mm');
}

export function formatDayMonth(ts: number | Date): string {
  return format(ts, 'dd/MM');
}

export function formatFullDate(ts: number | Date): string {
  const d = new Date(ts);
  return `${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()] ?? ''} ${d.getFullYear()}`;
}

/** "yyyy-MM-dd" + "HH:mm" → epoch ms in local time. */
export function combineDateTime(dateStr: string, timeStr: string): number {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0).getTime();
}

export function toDateInput(ts: number): string {
  return format(ts, 'yyyy-MM-dd');
}

export function toTimeInput(ts: number): string {
  return format(ts, 'HH:mm');
}
