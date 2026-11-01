import type { CategoryFeedItem, EventFeedItem } from '../api/types';

export type TimelineFilter = 'all' | 'today' | 'tomorrow' | 'this_week' | 'upcoming' | 'date';
export type PricingFilter = 'ALL' | 'FREE' | 'PAID';

export const localDate = (input?: string | Date | number | null): string => {
  if (!input) return '';
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toLocalDateString = localDate;

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return 'By Date';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return 'By Date';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isEventOnDate = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
  targetDateStr?: string | null,
): boolean => {
  if (!startInput || !targetDateStr) return false;
  const startStr = localDate(startInput);
  if (!startStr) return false;
  const endStr = endInput ? localDate(endInput) : startStr;
  return startStr === targetDateStr || (targetDateStr >= startStr && targetDateStr <= endStr);
};

export const isEventToday = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
  now = new Date(),
): boolean => isEventOnDate(startInput, endInput, localDate(now));

export const isEventTomorrow = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
  now = new Date(),
): boolean => {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return isEventOnDate(startInput, endInput, localDate(tomorrow));
};

export const isEventThisWeek = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
  now = new Date(),
): boolean => {
  if (!startInput) return false;
  const start = new Date(startInput);
  if (Number.isNaN(start.getTime())) return false;
  const end = endInput ? new Date(endInput) : start;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const endOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSunday,
    23,
    59,
    59,
    999,
  );
  return start <= endOfWeek && end >= startOfWeek;
};

export const isEventThisWeekend = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
  now = new Date(),
): boolean => {
  if (!startInput) return false;
  const start = new Date(startInput);
  if (Number.isNaN(start.getTime())) return false;
  const end = endInput ? new Date(endInput) : start;
  const day = now.getDay();
  const daysUntilSat = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
  const startOfSat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat, 0, 0, 0, 0);
  const endOfSun = new Date(startOfSat.getFullYear(), startOfSat.getMonth(), startOfSat.getDate() + 1, 23, 59, 59, 999);
  return start <= endOfSun && end >= startOfSat;
};

export const matchesScheduleFilter = (
  event: { start_at: string; end_at?: string | null },
  filterType: string = 'all',
  customTargetDate?: string | null,
  now = new Date(),
): boolean => {
  if (!event || !event.start_at) return false;
  if (customTargetDate) {
    return isEventOnDate(event.start_at, event.end_at, customTargetDate);
  }
  switch (filterType.toLowerCase()) {
    case 'all':
      return true;
    case 'today':
      return isEventToday(event.start_at, event.end_at, now);
    case 'tomorrow':
      return isEventTomorrow(event.start_at, event.end_at, now);
    case 'this_week':
      return isEventThisWeek(event.start_at, event.end_at, now);
    case 'weekend':
      return isEventThisWeekend(event.start_at, event.end_at, now);
    case 'upcoming': {
      const end = event.end_at ? new Date(event.end_at) : new Date(event.start_at);
      return !Number.isNaN(end.getTime()) && end.getTime() >= now.getTime();
    }
    case 'date':
      return true;
    default:
      return true;
  }
};

export const eventMatchesTimeline = (
  event: EventFeedItem,
  timeline: TimelineFilter,
  date: string,
  now = new Date(),
): boolean => matchesScheduleFilter(event, timeline, date || null, now);

export const sortUpcoming = (events: EventFeedItem[]): EventFeedItem[] =>
  [...events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

export const formatEventDateRange = (startValue: string, endValue?: string | null): string => {
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return '';
  const format = (value: Date) => `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`;
  if (!endValue) return format(start);
  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return format(start);
  return start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()
    ? format(start)
    : `${format(start)} – ${format(end)}`;
};

/**
 * Formats a timestamp into a premium 12-hour format with exactly 4 digits: 'hh:mm AM/PM'
 * (e.g., '03:00 PM', '09:05 AM', '12:00 PM', '12:00 AM').
 */
export const formatEventTime = (dateInput?: string | Date | number | null): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourStr = String(hours).padStart(2, '0');
  const minuteStr = String(minutes).padStart(2, '0');
  return `${hourStr}:${minuteStr} ${period}`;
};

/**
 * Formats start and optional end time into premium 12-hour format:
 * '03:00 PM' or '03:00 PM – 05:30 PM'
 */
export const formatEventTimeRange = (
  startInput?: string | Date | number | null,
  endInput?: string | Date | number | null,
): string => {
  if (!startInput) return '';
  const startStr = formatEventTime(startInput);
  if (!startStr) return '';
  if (!endInput) return startStr;
  const endStr = formatEventTime(endInput);
  if (!endStr || endStr === startStr) return startStr;
  return `${startStr} – ${endStr}`;
};

export const normalizeCategories = (value: unknown): CategoryFeedItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): CategoryFeedItem[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.name !== 'string') return [];
    const subcategories = Array.isArray(record.subcategories)
      ? record.subcategories.flatMap((sub) => {
        if (!sub || typeof sub !== 'object') return [];
        const child = sub as Record<string, unknown>;
        return typeof child.id === 'string' && typeof child.name === 'string' && typeof child.key === 'string'
          ? [{ id: child.id, key: child.key, name: child.name, category_id: typeof child.category_id === 'string' ? child.category_id : undefined }]
          : [];
      })
      : [];
    return [{ id: record.id, key: typeof record.key === 'string' ? record.key : record.id, name: record.name, subcategories }];
  });
};

export const rankEventNames = (events: EventFeedItem[], query: string): EventFeedItem[] => {
  const normalized = query.trim().toLocaleLowerCase();
  if (normalized.length < 2) return [];
  return events
    .map((event, index) => {
      const name = event.name.toLocaleLowerCase();
      const score = name.startsWith(normalized) ? 2 : name.includes(normalized) ? 1 : 0;
      return { event, score, index };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || new Date(a.event.start_at).getTime() - new Date(b.event.start_at).getTime() || a.index - b.index)
    .map((entry) => entry.event);
};
