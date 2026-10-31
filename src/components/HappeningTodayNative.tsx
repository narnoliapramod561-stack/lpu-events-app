import React, { memo, useMemo, useRef } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EventFeedItem, NativeAdSystemConfig, NativeAdvertisement } from '../api/types';
import { colors, radii, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import { DirectAdBanner } from './DirectAdBanner';

interface HappeningTodayNativeProps {
  events: EventFeedItem[];
  ads: NativeAdvertisement[];
  adConfig: NativeAdSystemConfig | null;
  dark: boolean;
  onSelectEvent: (id: string) => void;
  onViewAll: () => void;
}

type CardItem = { kind: 'event'; event: EventFeedItem } | { kind: 'ad'; ad: NativeAdvertisement };

const EventCard = memo(function EventCard({ event, dark, onPress }: { event: EventFeedItem; dark: boolean; onPress: () => void }) {
  const palette = dark ? colors.dark : colors.light;
  const image = eventImageSource(event);
  const start = new Date(event.start_at);
  const time = Number.isNaN(start.getTime()) ? '' : start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={event.name} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.outline }]}>
      <View style={styles.imageBox}>
        {image ? <Image source={image} resizeMode="contain" style={styles.image} /> : <View style={styles.imageFallback} />}
        <View style={styles.category}><Text style={styles.categoryText}>{event.categories?.name || 'Event'}</Text></View>
      </View>
      <View style={styles.details}>
        <Text numberOfLines={1} style={[styles.name, { color: palette.text }]}>{event.name}</Text>
        <Text numberOfLines={1} style={[styles.meta, { color: palette.mutedText }]}>{time}{event.venue_name ? ` • ${event.venue_name}` : ''}</Text>
      </View>
    </Pressable>
  );
});

function HappeningTodayNativeComponent({ events, ads, adConfig, dark, onSelectEvent, onViewAll }: HappeningTodayNativeProps) {
  const palette = dark ? colors.dark : colors.light;
  const listRef = useRef<FlatList<CardItem>>(null);
  const items = useMemo<CardItem[]>(() => {
    const limited = events.slice(0, 10).map((event) => ({ kind: 'event' as const, event }));
    const placement = adConfig?.placements.happening_today;
    if (!adConfig?.global_enabled || !placement?.enabled || placement.provider !== 'direct' || !ads.length) return limited;
    const selected = placement.selected_ad_ids?.length
      ? placement.selected_ad_ids.map((id) => ads.find((ad) => ad.id === id)).filter((ad): ad is NativeAdvertisement => Boolean(ad))
      : ads;
    const result: CardItem[] = [];
    let adIndex = 0;
    const frequency = Math.max(placement.frequency ?? 2, 1);
    limited.forEach((item, index) => {
      result.push(item);
      if ((index + 1) % frequency === 0 && adIndex < Math.min(placement.max_ads ?? 2, selected.length)) {
        result.push({ kind: 'ad', ad: selected[adIndex++] });
      }
    });
    return result;
  }, [adConfig, ads, events]);

  if (!events.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingGroup}>
          <View style={styles.calendar}><Text style={styles.calendarText}>▦</Text></View>
          <View>
            <Text style={[styles.heading, { color: palette.text }]}>Happening <Text style={styles.headingAccent}>Today</Text></Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>Live schedule & campus events</Text>
          </View>
        </View>
        <Pressable onPress={onViewAll} accessibilityRole="button" style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All {events.length} →</Text>
        </Pressable>
      </View>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.kind === 'event' ? item.event.id : `ad-${item.ad.id}-${index}`}
        contentContainerStyle={styles.listContent}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        renderItem={({ item }) => item.kind === 'event'
          ? <EventCard event={item.event} dark={dark} onPress={() => onSelectEvent(item.event.id)} />
          : <View style={styles.adCard}><DirectAdBanner ad={item.ad} dark={dark} compact /></View>}
      />
    </View>
  );
}

export const HappeningTodayNative = memo(HappeningTodayNativeComponent);

const styles = StyleSheet.create({
  section: { marginTop: spacing.section, marginBottom: spacing.md },
  headingRow: { marginHorizontal: spacing.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  headingGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  calendar: { width: 38, height: 38, borderRadius: radii.sm, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  calendarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heading: { fontFamily: typography.headingFamily, fontSize: 19, lineHeight: 23, fontWeight: '900' },
  headingAccent: { color: '#f97316' },
  subtitle: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  viewAll: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: 'rgba(249,115,22,0.12)' },
  viewAllText: { color: '#ea580c', fontSize: 11, fontWeight: '900' },
  listContent: { paddingHorizontal: spacing.gutter, gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
  card: { width: 280, borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
  imageBox: { height: 158, backgroundColor: 'rgba(100,116,139,0.08)' },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, backgroundColor: '#182033' },
  category: { position: 'absolute', top: spacing.sm, right: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.86)' },
  categoryText: { color: '#334155', fontSize: 10, fontWeight: '900' },
  details: { height: 74, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '900' },
  meta: { fontSize: 11, fontWeight: '700' },
  adCard: { width: 280, justifyContent: 'center' },
});
