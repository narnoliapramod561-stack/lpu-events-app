/**
 * Slug and URL utilities for LPU Events Mobile App
 * Mirrors student website slugification and event ID extraction.
 */

/**
 * Converts any text into a clean URL-safe slug.
 */
export function slugify(text?: string | null): string {
  if (!text || !text.trim()) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, '') // strip leading and trailing hyphens
    .slice(0, 80) // reasonable max slug length
    .replace(/-+$/, '');
}

/**
 * Creates a clean, premium URL slug for an event.
 * Example:
 *   createEventSlug("One India Festival 2026", "258ff039-fdff-41f8-a4d9-efd778feed18")
 *   => "one-india-festival-2026"
 */
export function createEventSlug(name?: string | null, id?: string | null): string {
  const cleanName = slugify(name);
  if (cleanName) {
    return cleanName;
  }
  return (id || '').trim();
}

/**
 * UUID regex pattern matching standard 36-character hyphenated UUIDs.
 */
export const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

/**
 * Checks whether a string is a valid standard UUID.
 */
export function isUuid(value?: string | null): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value.trim());
}

/**
 * Extracts event identifier from URL parameter or navigation route.
 * Handles clean slugs, embedded UUIDs, or prefixed IDs.
 */
export function extractEventId(slugOrId?: string | null): string {
  if (!slugOrId) return '';
  const trimmed = slugOrId.trim();

  // 1. Standard UUID match (36 characters: 8-4-4-4-12 hex chars)
  const uuidMatch = trimmed.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1].toLowerCase();
  }

  // 2. Custom prefixed IDs like evt-test-12345
  const evtMatch = trimmed.match(/(evt[-_][a-z0-9-_]+)/i);
  if (evtMatch) {
    return evtMatch[1];
  }

  // 3. Clean slug (e.g., "academics-seminar-live-session-2026")
  return slugify(trimmed) || trimmed;
}
