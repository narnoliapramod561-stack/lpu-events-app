export type RegistrationMode = 'NONE' | 'EXTERNAL';
export type EventPricingType = 'FREE' | 'PAID';

export interface EventFeedItem {
  id: string;
  name: string;
  description?: string;
  start_at: string;
  end_at: string;
  venue_name: string;
  registration_mode: RegistrationMode;
  pricing_type: EventPricingType;
  price_amount?: number | null;
  external_registration_url?: string | null;
  registration_format?: 'INDIVIDUAL' | 'TEAM' | null;
  banner_media_id: string | null;
  media_assets?: { id: string; object_key: string; bucket?: string } | null;
  status?: string;
  deleted_at?: string | null;
  organizations: { name: string } | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  categories?: { name: string; key?: string } | null;
  subcategories?: { name: string; key?: string } | null;
  is_trending?: boolean;
  trending_sort_order?: number;
}

export interface CategoryFeedItem {
  id: string;
  key: string;
  name: string;
  sort_order?: number;
  subcategories?: Array<{
    id: string;
    category_id?: string;
    key: string;
    name: string;
    sort_order?: number;
  }>;
}

export interface EventDetails extends EventFeedItem {
  organization_id: string;
  created_by?: string;
  updated_by?: string;
  capacity_limit?: number | null;
  created_at?: string;
  updated_at?: string;
  event_content_sections?: Array<{
    id: string;
    event_id?: string;
    section_type: string;
    title: string;
    content: unknown;
    sort_order: number;
  }>;
}

export interface HomepageBundle {
  categories: unknown[];
  carousel: unknown[];
  featured: unknown[];
  trending: EventFeedItem[];
  settings: Array<{ key: string; value: unknown }>;
  events: EventFeedItem[];
}

export interface NativeCarouselItem {
  id: string;
  item_type: 'EVENT' | 'MEDIA';
  event_id?: string | null;
  media_id?: string | null;
  is_active: boolean;
  display_duration_ms?: number;
  custom_title?: string | null;
  custom_subtitle?: string | null;
  custom_cta_text?: string | null;
  custom_cta_url?: string | null;
  badge_text?: string | null;
  events?: EventFeedItem | null;
  media_assets?: NativeMediaAsset | null;
}

export interface NativeMediaAsset {
  id?: string;
  object_key: string;
  bucket?: string;
}

export interface NativeHappeningTodayConfig {
  slide_duration_ms?: number;
  auto_advance?: boolean;
}

export interface SnapshotManifest {
  schema_version: string;
  revision: string;
  generation?: number;
  published_at: string;
  resources: {
    homepage: string;
    catalogue: string;
    categories: string;
    event_details_dir: string;
    archive_catalogue?: string;
  };
  meta: Record<string, unknown>;
}

export interface HomepageSnapshot extends HomepageBundle {
  schema_version: string;
  revision: string;
  generated_at: string;
}

export interface EventsCatalogueSnapshot {
  schema_version: string;
  revision: string;
  generated_at: string;
  total_count: number;
  events: unknown[];
}

export interface CategoriesSnapshot {
  schema_version: string;
  revision: string;
  generated_at: string;
  total_count: number;
  categories: unknown[];
}

export type PublicApiErrorCode =
  | 'INVALID_ARGUMENT'
  | 'INVALID_RESPONSE'
  | 'INVALID_CONTENT_TYPE'
  | 'HTTP_ERROR'
  | 'MAINTENANCE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'STORAGE_ERROR'
  | 'NOT_FOUND';

export interface PublicApiError {
  code: PublicApiErrorCode;
  message: string;
  status?: number;
  retryable?: boolean;
}

export type ApiResult<T> =
  | { data: T; error: null; fromCache?: boolean; stale?: boolean }
  | { data: null; error: PublicApiError; fromCache?: boolean; stale?: boolean };
