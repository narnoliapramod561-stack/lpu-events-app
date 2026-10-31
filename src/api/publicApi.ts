import { NativeCache } from '../cache/nativeCache.ts';
import type {
  ApiResult,
  EventDetails,
  EventFeedItem,
  EventsCatalogueSnapshot,
  CategoriesSnapshot,
  HomepageBundle,
  HomepageSnapshot,
  PublicApiError,
  SnapshotManifest,
} from './types';

export const PUBLIC_API_BASE_URL = 'https://lpuevents.live/api/public';
export const PUBLIC_CONTENT_BASE_URL = 'https://images.lpuevents.live/public-content';

export interface EventFeedFilters {
  category_id?: string;
  subcategory_id?: string;
  pricing_type?: string;
  timeline?: string;
  date?: string;
  limit?: number;
  offset?: number;
  show_past?: boolean;
}

export interface PublicApiOptions {
  fetchFn?: typeof fetch;
  cache?: NativeCache;
  timeoutMs?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isEvent = (value: unknown): value is EventFeedItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.start_at === 'string' &&
  typeof value.end_at === 'string' &&
  typeof value.venue_name === 'string' &&
  (value.registration_mode === 'NONE' || value.registration_mode === 'EXTERNAL') &&
  (value.pricing_type === 'FREE' || value.pricing_type === 'PAID');
const isEventList = (value: unknown): value is EventFeedItem[] =>
  Array.isArray(value) && value.every(isEvent);
const isHomepage = (value: unknown): value is HomepageBundle =>
  isRecord(value) &&
  Array.isArray(value.categories) &&
  Array.isArray(value.carousel) &&
  Array.isArray(value.featured) &&
  isEventList(value.trending) &&
  Array.isArray(value.advertisements) &&
  Array.isArray(value.settings) &&
  value.settings.every((setting) => isRecord(setting) && typeof setting.key === 'string' && 'value' in setting) &&
  isEventList(value.events);
const isManifest = (value: unknown): value is SnapshotManifest =>
  isRecord(value) &&
  value.schema_version === '1.0.0' &&
  typeof value.revision === 'string' &&
  typeof value.published_at === 'string' &&
  isRecord(value.resources) &&
  typeof value.resources.homepage === 'string' &&
  typeof value.resources.catalogue === 'string' &&
  typeof value.resources.categories === 'string' &&
  typeof value.resources.event_details_dir === 'string';
const isHomepageSnapshot = (value: unknown): value is HomepageSnapshot =>
  isRecord(value) &&
  typeof value.schema_version === 'string' &&
  typeof value.revision === 'string' &&
  typeof value.generated_at === 'string' &&
  isHomepage(value);
const isCatalogueSnapshot = (value: unknown): value is EventsCatalogueSnapshot =>
  isRecord(value) &&
  typeof value.schema_version === 'string' &&
  typeof value.revision === 'string' &&
  typeof value.generated_at === 'string' &&
  typeof value.total_count === 'number' &&
  Array.isArray(value.events);
const isCategoriesSnapshot = (value: unknown): value is CategoriesSnapshot =>
  isRecord(value) &&
  typeof value.schema_version === 'string' &&
  typeof value.revision === 'string' &&
  typeof value.generated_at === 'string' &&
  typeof value.total_count === 'number' &&
  Array.isArray(value.categories);
const isDetails = (value: unknown): value is EventDetails => isEvent(value);

function error(code: PublicApiError['code'], message: string, extra: Partial<PublicApiError> = {}): PublicApiError {
  return { code, message, ...extra };
}

export class PublicApiClient {
  private readonly fetchFn: typeof fetch;
  private readonly cache: NativeCache;
  private readonly timeoutMs: number;
  private readonly inFlight = new Map<string, Promise<ApiResult<unknown>>>();
  private snapshotRevision: string | undefined;

  constructor(options: PublicApiOptions = {}) {
    this.fetchFn = options.fetchFn ?? fetch.bind(globalThis);
    this.cache = options.cache ?? new NativeCache();
    this.timeoutMs = options.timeoutMs ?? 12_000;
  }

  private async requestOnce<T>(url: string, validate: (value: unknown) => value is T): Promise<ApiResult<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchFn(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        const code = response.status === 503 ? 'MAINTENANCE' : 'HTTP_ERROR';
        return { data: null, error: error(code, code === 'MAINTENANCE' ? 'The event service is temporarily unavailable.' : `Public API request failed (${response.status}).`, { status: response.status, retryable: response.status >= 500 }) };
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType && !contentType.toLowerCase().includes('application/json')) {
        return { data: null, error: error('INVALID_CONTENT_TYPE', 'The public API returned an unexpected response.') };
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return { data: null, error: error('INVALID_RESPONSE', 'The public API returned malformed JSON.') };
      }
      return validate(payload)
        ? { data: payload, error: null }
        : { data: null, error: error('INVALID_RESPONSE', 'The public API returned an unexpected data shape.') };
    } catch (cause) {
      const timedOut = cause instanceof Error && cause.name === 'AbortError';
      return { data: null, error: error(timedOut ? 'TIMEOUT' : 'NETWORK_ERROR', timedOut ? 'The public API request timed out.' : 'The public API is unreachable.', { retryable: true }) };
    } finally {
      clearTimeout(timer);
    }
  }

  private async request<T>(url: string, validate: (value: unknown) => value is T): Promise<ApiResult<T>> {
    let result = await this.requestOnce(url, validate);
    if (result.error?.retryable) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      result = await this.requestOnce(url, validate);
    }
    return result;
  }

  private singleFlight<T>(key: string, operation: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<ApiResult<T>>;
    const promise = operation().finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise as Promise<ApiResult<unknown>>);
    return promise;
  }

  private async cached<T>(
    key: string,
    validate: (value: unknown) => value is T,
    ttlMs: number,
    operation: () => Promise<ApiResult<T>>,
    revision?: string,
  ): Promise<ApiResult<T>> {
    const cached = await this.cache.read(key, validate, { allowStale: true, revision });
    if (cached && !cached.stale) {
      return { data: cached.data, error: null, fromCache: true };
    }
    const refresh = this.singleFlight(key, async () => {
      const result = await operation();
      if (result.data !== null) {
        await this.cache.write(key, result.data, ttlMs, ttlMs, revision);
        return result;
      }
      if (cached) return { data: cached.data, error: null, fromCache: true, stale: true };
      return result;
    });
    if (cached) {
      void refresh;
      return { data: cached.data, error: null, fromCache: true, stale: true };
    }
    return refresh;
  }

  private apiUrl(path: string): string {
    return `${PUBLIC_API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  }

  async getHomepage(forceRefresh = false): Promise<ApiResult<HomepageBundle>> {
    if (forceRefresh) await this.cache.remove('homepage');
    return this.cached('homepage', isHomepage, 30 * 60_000, () => this.request(this.apiUrl('homepage'), isHomepage));
  }

  async getEventFeed(filters: EventFeedFilters = {}, forceRefresh = false): Promise<ApiResult<EventFeedItem[]>> {
    const limit = Math.min(Math.max(Math.floor(filters.limit ?? 9), 1), 50);
    const offset = Math.max(Math.floor(filters.offset ?? 0), 0);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, limit, offset })) {
      if (key !== 'show_past' && value !== undefined && value !== '') params.set(key, String(value));
    }
    if (filters.show_past) params.set('show_past', 'true');
    const key = `events:${params.toString()}`;
    if (forceRefresh) await this.cache.remove(key);
    return this.cached(key, isEventList, 60_000, () => this.request(`${this.apiUrl('events')}?${params}`, isEventList));
  }

  async searchEvents(query: string, options: EventFeedFilters & { event_name_only?: boolean } = {}): Promise<ApiResult<EventFeedItem[]>> {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s-]/g, '').slice(0, 100);
    if (normalized.length < 2) return { data: [], error: null };
    const params = new URLSearchParams({ q: normalized, limit: String(Math.min(Math.max(options.limit ?? 20, 1), 20)), offset: String(Math.max(options.offset ?? 0, 0)) });
    for (const key of ['category_id', 'subcategory_id', 'pricing_type', 'timeline', 'date'] as const) {
      if (options[key]) params.set(key, options[key]!);
    }
    if (options.event_name_only) params.set('event_name_only', 'true');
    return this.cached(`search:${params.toString()}`, isEventList, 60_000, () => this.request(`${this.apiUrl('search')}?${params}`, isEventList));
  }

  async getEventDetails(identifier: string): Promise<ApiResult<EventDetails>> {
    const clean = identifier.trim();
    if (!clean || !/^[a-zA-Z0-9_-]+$/.test(clean)) return { data: null, error: error('INVALID_ARGUMENT', 'A valid event identifier is required.') };
    const key = `detail:${clean}`;
    return this.cached(key, isDetails, 120_000, () => this.request(this.apiUrl(`events/${encodeURIComponent(clean)}`), isDetails));
  }

  async getSnapshotManifest(forceRefresh = false): Promise<ApiResult<SnapshotManifest>> {
    if (forceRefresh) await this.cache.remove('snapshot:manifest');
    const result = await this.cached('snapshot:manifest', isManifest, 60_000, () => this.request(`${PUBLIC_CONTENT_BASE_URL}/manifest.json`, isManifest));
    if (result.data) this.snapshotRevision = result.data.revision;
    return result;
  }

  async getHomepageSnapshot(): Promise<ApiResult<HomepageSnapshot>> {
    const manifest = await this.getSnapshotManifest();
    if (!manifest.data) return manifest as ApiResult<HomepageSnapshot>;
    this.snapshotRevision = manifest.data.revision;
    return this.cached(`snapshot:homepage:${manifest.data.revision}`, isHomepageSnapshot, 24 * 60 * 60_000, () => this.request(`${PUBLIC_CONTENT_BASE_URL}/${manifest.data!.resources.homepage}`, isHomepageSnapshot), manifest.data.revision);
  }

  async getHomepageWithSnapshot(): Promise<ApiResult<HomepageBundle>> {
    const snapshot = await this.getHomepageSnapshot();
    return snapshot.data ? snapshot : this.getHomepage();
  }

  async getEventsCatalogueSnapshot(): Promise<ApiResult<EventsCatalogueSnapshot>> {
    const manifest = await this.getSnapshotManifest();
    if (!manifest.data) return manifest as ApiResult<EventsCatalogueSnapshot>;
    return this.cached(`snapshot:catalogue:${manifest.data.revision}`, isCatalogueSnapshot, 24 * 60 * 60_000, () => this.request(`${PUBLIC_CONTENT_BASE_URL}/${manifest.data!.resources.catalogue}`, isCatalogueSnapshot), manifest.data.revision);
  }

  async getEventsCatalogueWithSnapshot(): Promise<ApiResult<EventsCatalogueSnapshot>> {
    const snapshot = await this.getEventsCatalogueSnapshot();
    if (snapshot.data) return snapshot;
    return snapshot;
  }

  async getCategoriesSnapshot(): Promise<ApiResult<CategoriesSnapshot>> {
    const manifest = await this.getSnapshotManifest();
    if (!manifest.data) return manifest as ApiResult<CategoriesSnapshot>;
    return this.cached(
      `snapshot:categories:${manifest.data.revision}`,
      isCategoriesSnapshot,
      24 * 60 * 60_000,
      () => this.request(`${PUBLIC_CONTENT_BASE_URL}/${manifest.data!.resources.categories}`, isCategoriesSnapshot),
      manifest.data.revision,
    );
  }

  async getEventDetailsWithSnapshot(identifier: string): Promise<ApiResult<EventDetails>> {
    const snapshot = await this.getSnapshotManifest();
    if (snapshot.data) {
      const detail = await this.request(`${PUBLIC_CONTENT_BASE_URL}/${snapshot.data.resources.event_details_dir.replace(/\/+$/, '')}/${encodeURIComponent(identifier)}.json`, isDetails);
      if (detail.data) return detail;
    }
    return this.getEventDetails(identifier);
  }

  invalidate(): void {
    this.cache.clearMemory();
    this.snapshotRevision = undefined;
  }
}
