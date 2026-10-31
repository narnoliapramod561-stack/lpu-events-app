import type { CategoryFeedItem, EventFeedItem } from '../api/types';

export type TimelineFilter = 'all' | 'today' | 'tomorrow' | 'this_week' | 'date';
export type PricingFilter = 'ALL' | 'FREE' | 'PAID';

export const localDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const eventDate = (value: string): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : localDate(parsed);
};

export const eventMatchesTimeline = (
  event: EventFeedItem,
  timeline: TimelineFilter,
  date: string,
  now = new Date(),
): boolean => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(start);
  endOfWeek.setDate(endOfWeek.getDate() + (now.getDay() === 0 ? 0 : 7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const eventStart = new Date(event.start_at);
  const eventEnd = new Date(event.end_at);
  if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime())) return false;
  if (timeline === 'date') return eventDate(event.start_at) <= date && date <= eventDate(event.end_at);
  if (timeline === 'today') return eventStart < tomorrow && eventEnd >= start;
  if (timeline === 'tomorrow') {
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    return eventStart < tomorrowEnd && eventEnd >= tomorrow;
  }
  if (timeline === 'this_week') return eventStart <= endOfWeek && eventEnd >= start;
  return true;
};

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
