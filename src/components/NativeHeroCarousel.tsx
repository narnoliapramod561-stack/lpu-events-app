import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { EventFeedItem, NativeAdSystemConfig, NativeAdvertisement, NativeCarouselItem } from '../api/types';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource, mediaUrl } from '../features/homepageModels';
import { DirectAdBanner } from './DirectAdBanner';

interface NativeHeroCarouselProps {
  items: NativeCarouselItem[];
  featuredEvents: EventFeedItem[];
  ads: NativeAdvertisement[];
  adConfig: NativeAdSystemConfig | null;
  dark: boolean;
  onSelectEvent: (id: string) => void;
}

interface Slide {
  id: string;
  title: string;
  description?: string;
  image: ReturnType<typeof eventImageSource>;
  category: string;
  date?: string;
  time?: string;
  venue?: string;
  eventId?: string;
  ad?: NativeAdvertisement;
  duration: number;
}

const dateLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

function NativeHeroCarouselComponent({ items, featuredEvents, ads, adConfig, dark, onSelectEvent }: NativeHeroCarouselProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const palette = dark ? colors.dark : colors.light;

  const slides = useMemo<Slide[]>(() => {
    const eventById = new Map(featuredEvents.map((event) => [event.id, event]));
    const base = items.filter((item) => item.is_active).flatMap<Slide>((item) => {
      if (item.item_type === 'ADVERTISEMENT') {
        const ad = item.advertisements ?? ads.find((candidate) => candidate.id === item.advertisement_id);
        return ad ? [{ id: item.id, title: item.custom_title || ad.name, description: item.custom_subtitle || 'Featured university partner promotion.', image: mediaUrl(ad.media_assets) ? { uri: mediaUrl(ad.media_assets)! } : require('../../assets/defaults/hero_default.webp'), category: item.badge_text || 'Sponsored Partner', ad, duration: item.display_duration_ms || 5000 }] : [];
      }
      if (item.item_type === 'EVENT') {
        const event = (item.event_id && eventById.get(item.event_id)) || item.events;
        if (!event) return [];
        return [{
          id: item.id,
          title: item.custom_title || event.name,
          description: item.custom_subtitle || event.description,
          image: eventImageSource(event),
          category: item.badge_text || event.categories?.name || 'Featured Event',
          date: dateLabel(event.start_at),
          time: timeLabel(event.start_at),
          venue: event.venue_name,
          eventId: event.id,
          duration: item.display_duration_ms || 5000,
        }];
      }
      return item.media_assets ? [{
        id: item.id,
        title: item.custom_title || 'Campus Spotlight',
        description: item.custom_subtitle || 'Featured university stories and announcements.',
        image: mediaUrl(item.media_assets) ? { uri: mediaUrl(item.media_assets)! } : require('../../assets/defaults/hero_default.webp'),
        category: item.badge_text || 'Spotlight',
        duration: item.display_duration_ms || 5000,
      }] : [];
    });
    const fallback = base;
    const placement = adConfig?.placements.hero_carousel;
    if (!adConfig?.global_enabled || !placement?.enabled || placement.provider !== 'direct' || !ads.length) return fallback;
    const selected = placement.selected_ad_ids?.length
      ? placement.selected_ad_ids.map((id) => ads.find((ad) => ad.id === id)).filter((ad): ad is NativeAdvertisement => Boolean(ad))
      : ads;
    const maxAds = Math.min(placement.max_ads ?? 3, selected.length);
    const frequency = Math.max(placement.frequency ?? 2, 1);
    const result: Slide[] = [];
    let adIndex = 0;
    fallback.forEach((slide, slideIndex) => {
      result.push(slide);
      if ((slideIndex + 1) % frequency === 0 && adIndex < maxAds) {
        const ad = selected[adIndex++];
        result.push({ id: `hero-ad-${ad.id}-${slideIndex}`, title: ad.name, description: 'Featured university partner promotion.',         image: mediaUrl(ad.media_assets) ? { uri: mediaUrl(ad.media_assets)! } : require('../../assets/defaults/hero_default.webp'), category: 'Sponsored Partner', ad, duration: 5000 });
      }
    });
    return result;
  }, [adConfig, ads, featuredEvents, items]);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [index, slides.length]);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (slides.length < 2 || interacting) return;
    timer.current = setTimeout(() => setIndex((current) => (current + 1) % slides.length), slides[index]?.duration || 5000);
  }, [index, interacting, slides]);

  useEffect(() => {
    schedule();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [schedule]);

  if (!slides.length) {
    return (
      <View style={[styles.empty, { backgroundColor: palette.surface, borderColor: palette.outline }]}>
        <Text style={[styles.emptyTitle, { color: palette.text }]}>Featured events</Text>
        <Text style={{ color: palette.mutedText }}>New campus highlights will appear here.</Text>
      </View>
    );
  }

  const slide = slides[index];
  const goTo = (next: number) => {
    setInteracting(true);
    if (timer.current) clearTimeout(timer.current);
    setIndex((next + slides.length) % slides.length);
    setTimeout(() => setInteracting(false), 350);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={slide.title}
        onPress={() => slide.ad ? undefined : slide.eventId ? onSelectEvent(slide.eventId) : undefined}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
        style={[styles.card, { height: Math.min(width * 0.625, 360), backgroundColor: palette.surface }]}
      >
        {slide.image ? <Image source={slide.image} resizeMode="contain" style={styles.image} /> : <View style={styles.imageFallback} />}
        <Pressable accessibilityLabel="Previous featured item" onPress={() => goTo(index - 1)} style={[styles.arrow, styles.leftArrow]}><Text style={styles.arrowText}>‹</Text></Pressable>
        <Pressable accessibilityLabel="Next featured item" onPress={() => goTo(index + 1)} style={[styles.arrow, styles.rightArrow]}><Text style={styles.arrowText}>›</Text></Pressable>
      </Pressable>
      <View style={styles.controls}>
        <View style={styles.dots}>{slides.map((item, dotIndex) => <View key={item.id} style={[styles.dot, dotIndex === index && styles.activeDot]} />)}</View>
      </View>
      {slide.ad ? <DirectAdBanner ad={slide.ad} dark={dark} compact /> : null}
    </View>
  );
}

export const NativeHeroCarousel = memo(NativeHeroCarouselComponent);

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: spacing.gutter, marginTop: spacing.md },
  card: { overflow: 'hidden', borderRadius: radii.xl, ...shadows.glass },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  imageFallback: { ...StyleSheet.absoluteFill, backgroundColor: '#182033' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  arrow: { position: 'absolute', top: '45%', zIndex: 2, width: 36, height: 36, borderRadius: radii.pill, backgroundColor: 'rgba(15,23,42,0.54)', alignItems: 'center', justifyContent: 'center' },
  leftArrow: { left: spacing.sm },
  rightArrow: { right: spacing.sm },
  arrowText: { fontSize: 27, lineHeight: 29, color: '#fff' },
  dots: { flexDirection: 'row', gap: 5, maxWidth: 180 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' },
  activeDot: { width: 18, backgroundColor: '#f97316' },
  empty: { marginHorizontal: spacing.gutter, marginTop: spacing.md, minHeight: 180, borderRadius: radii.xl, borderWidth: 1, padding: spacing.lg, justifyContent: 'center' },
  emptyTitle: { fontSize: typography.sizes.title, fontWeight: '800', marginBottom: spacing.xs },
});
