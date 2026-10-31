import type {
  EventFeedItem,
  HomepageBundle,
  NativeAdSystemConfig,
  NativeAdvertisement,
  NativeCarouselItem,
  NativeHappeningTodayConfig,
  NativeMediaAsset,
} from '../api/types';
import type { ImageSourcePropType } from 'react-native';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const mediaAsset = (value: unknown): NativeMediaAsset | null => {
  if (!isRecord(value) || typeof value.object_key !== 'string') return null;
  return {
    id: typeof value.id === 'string' ? value.id : undefined,
    object_key: value.object_key,
    bucket: typeof value.bucket === 'string' ? value.bucket : undefined,
  };
};

const event = (value: unknown): EventFeedItem | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  if (
    typeof value.start_at !== 'string' ||
    typeof value.end_at !== 'string' ||
    typeof value.venue_name !== 'string' ||
    (value.registration_mode !== 'NONE' && value.registration_mode !== 'EXTERNAL') ||
    (value.pricing_type !== 'FREE' && value.pricing_type !== 'PAID')
  ) {
    return null;
  }
  return value as unknown as EventFeedItem;
};

export const advertisement = (value: unknown): NativeAdvertisement | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  return {
    id: value.id,
    name: value.name,
    media_id: typeof value.media_id === 'string' ? value.media_id : null,
    redirect_url: typeof value.redirect_url === 'string' ? value.redirect_url : null,
    media_assets: mediaAsset(value.media_assets),
  };
};

export const normalizeCarouselItems = (value: unknown): NativeCarouselItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): NativeCarouselItem[] => {
    if (!isRecord(item) || typeof item.id !== 'string') return [];
    const itemType = item.item_type;
    if (itemType !== 'EVENT' && itemType !== 'ADVERTISEMENT' && itemType !== 'MEDIA') return [];
    return [{
      id: item.id,
      item_type: itemType,
      event_id: typeof item.event_id === 'string' ? item.event_id : null,
      advertisement_id: typeof item.advertisement_id === 'string' ? item.advertisement_id : null,
      media_id: typeof item.media_id === 'string' ? item.media_id : null,
      is_active: item.is_active !== false,
      display_duration_ms: typeof item.display_duration_ms === 'number' ? item.display_duration_ms : undefined,
      custom_title: typeof item.custom_title === 'string' ? item.custom_title : null,
      custom_subtitle: typeof item.custom_subtitle === 'string' ? item.custom_subtitle : null,
      custom_cta_text: typeof item.custom_cta_text === 'string' ? item.custom_cta_text : null,
      custom_cta_url: typeof item.custom_cta_url === 'string' ? item.custom_cta_url : null,
      badge_text: typeof item.badge_text === 'string' ? item.badge_text : null,
      events: event(item.events),
      advertisements: advertisement(item.advertisements),
      media_assets: mediaAsset(item.media_assets),
    }];
  });
};

export const normalizeAdvertisements = (value: unknown): NativeAdvertisement[] =>
  Array.isArray(value) ? value.flatMap((item) => {
    const normalized = advertisement(item);
    return normalized ? [normalized] : [];
  }) : [];

export const settingValue = (bundle: HomepageBundle, key: string): unknown => {
  const setting = bundle.settings.find((item) => item.key === key);
  if (!setting) return null;
  if (typeof setting.value !== 'string') return setting.value;
  try {
    return JSON.parse(setting.value);
  } catch {
    return null;
  }
};

export const normalizeAdSystemConfig = (value: unknown): NativeAdSystemConfig | null => {
  if (!isRecord(value) || !isRecord(value.placements)) return null;
  const placement = (candidate: unknown): NativeAdSystemConfig['placements']['hero_carousel'] => {
    if (!isRecord(candidate)) return undefined;
    const provider = candidate.provider;
    if (provider !== 'disabled' && provider !== 'adsense' && provider !== 'direct') return undefined;
    return {
      enabled: candidate.enabled !== false,
      provider: provider as 'disabled' | 'adsense' | 'direct',
      frequency: typeof candidate.frequency === 'number' ? candidate.frequency : undefined,
      max_ads: typeof candidate.max_ads === 'number' ? candidate.max_ads : undefined,
      selected_ad_ids: Array.isArray(candidate.selected_ad_ids)
        ? candidate.selected_ad_ids.filter((id): id is string => typeof id === 'string')
        : undefined,
    };
  };
  return {
    global_enabled: value.global_enabled !== false,
    max_ads_per_page: typeof value.max_ads_per_page === 'number' ? value.max_ads_per_page : undefined,
    placements: {
      hero_carousel: placement(value.placements.hero_carousel),
      happening_today: placement(value.placements.happening_today),
    },
  };
};

export const normalizeHappeningConfig = (value: unknown): NativeHappeningTodayConfig | null => {
  if (!isRecord(value)) return null;
  return {
    slide_duration_ms: typeof value.slide_duration_ms === 'number' ? value.slide_duration_ms : undefined,
    auto_advance: typeof value.auto_advance === 'boolean' ? value.auto_advance : undefined,
  };
};

export const mediaUrl = (value: unknown): string | null => {
  const asset = mediaAsset(value);
  if (!asset) return null;
  return /^https?:\/\//i.test(asset.object_key)
    ? asset.object_key
    : `https://images.lpuevents.live/${asset.object_key.replace(/^\/+/, '')}`;
};

const defaultAssets: Record<string, ImageSourcePropType> = {
  'academics_guest-lecture': require('../../assets/defaults/events/subcategories/academics_guest-lecture.webp'),
  'academics_seminar': require('../../assets/defaults/events/subcategories/academics_seminar.webp'),
  'co-curricular_others': require('../../assets/defaults/events/subcategories/co-curricular_others.webp'),
  'cultural_others': require('../../assets/defaults/events/subcategories/cultural_others.webp'),
  'others_miscellaneous-events': require('../../assets/defaults/events/subcategories/others_miscellaneous-events.webp'),
};

const cleanKey = (value: unknown) =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

export const eventImageSource = (value: unknown): ImageSourcePropType | null => {
  const record = isRecord(value) ? value : null;
  const remote = mediaUrl(record?.media_assets);
  if (remote) return { uri: remote };
  const category = isRecord(record?.categories) ? cleanKey(record.categories.key || record.categories.name) : '';
  const subcategory = isRecord(record?.subcategories) ? cleanKey(record.subcategories.key || record.subcategories.name) : '';
  const key = category && subcategory ? `${category}_${subcategory}` : '';
  return defaultAssets[key] || require('../../assets/defaults/events/subcategories/others_miscellaneous-events.webp');
};
