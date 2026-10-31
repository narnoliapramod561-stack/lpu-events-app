import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { LinearGradient, Stop, Rect as SvgRect } from 'react-native-svg';
import type { CategoryFeedItem, EventFeedItem } from '../api/types';
import { PublicApiClient } from '../api/publicApi';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import { eventMatchesTimeline, formatEventDateRange, localDate, normalizeCategories, rankEventNames, sortUpcoming, type PricingFilter, type TimelineFilter } from '../features/eventHub';
import { NativeIcon, type IconName } from './NativeIcon';

const api = new PublicApiClient();
const PAGE_SIZE = 9;
const timelineOptions: Array<[TimelineFilter, string]> = [['all', 'All'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['this_week', 'This Week'], ['date', 'By Date']];

interface EventHubProps {
  dark: boolean;
  initialEvents: EventFeedItem[];
  trendingEvents: EventFeedItem[];
  categoryData: unknown;
  initialQuery?: string;
  onSelectEvent: (id: string) => void;
  onCategoriesLayout?: (y: number) => void;
}

const formatDate = (event: EventFeedItem) => {
  const start = new Date(event.start_at);
  return Number.isNaN(start.getTime()) ? 'Date unavailable' : start.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const EventCard = memo(({ event, dark, onSelectEvent }: { event: EventFeedItem; dark: boolean; onSelectEvent: (id: string) => void }) => {
  const palette = dark ? colors.dark : colors.light;
  const start = new Date(event.start_at);
  return (
    <Pressable onPress={() => onSelectEvent(event.id)} accessibilityRole="button" accessibilityLabel={`View details for ${event.name}`} style={[styles.card, { backgroundColor: 'transparent', borderColor: palette.outline }]}>
      <View style={styles.cardSurface}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <LinearGradient id={`card-${event.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={dark ? 'rgba(36,36,42,0.90)' : 'rgba(255,255,255,0.90)'} />
          <Stop offset="55%" stopColor={dark ? 'rgba(30,30,36,0.88)' : 'rgba(255,255,255,0.80)'} />
          <Stop offset="100%" stopColor={dark ? 'rgba(26,26,30,0.94)' : 'rgba(255,255,255,0.85)'} />
        </LinearGradient>
        <SvgRect width="100%" height="100%" fill={`url(#card-${event.id})`} />
      </Svg>
      <View style={styles.poster}>
        <Image source={eventImageSource(event) ?? undefined} resizeMode="contain" style={styles.posterImage} />
        <View style={styles.posterShade} />
        <Text style={styles.category}>{(event.categories?.name ?? 'Campus Event').toUpperCase()}</Text>
        {event.is_trending ? <View style={styles.trending}><NativeIcon name="flame" size={11} color="#fff" /><Text style={styles.trendingText}>TRENDING</Text></View> : null}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.name, { color: dark ? palette.text : '#c2410c' }]}>{event.name}</Text>
        <View style={styles.metadata}>
          <MetaRow icon="calendar" label="DATE" value={formatEventDateRange(event.start_at, event.end_at)} dark={dark} />
          <MetaRow icon="clock" label="SCHEDULE" value={Number.isNaN(start.getTime()) ? 'Time unavailable' : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} dark={dark} />
          <MetaRow icon="map-pin" label="VENUE" value={event.venue_name || 'LPU Campus'} dark={dark} />
        </View>
        <View style={[styles.footer, { borderTopColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(148,163,184,0.24)' }]}>
          <Text style={[styles.price, { color: event.pricing_type === 'FREE' ? '#16a34a' : '#ea580c' }]}>{event.pricing_type === 'FREE' ? 'FREE' : 'PAID'}</Text>
          <View style={styles.detailsButton}><Text style={styles.details}>View Details</Text><NativeIcon name="arrow-right" size={13} color="#fff" /></View>
        </View>
      </View>
      </View>
    </Pressable>
  );
});

function MetaRow({ icon, label, value, dark }: { icon: IconName; label: string; value: string; dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.metaRow}>
      <View style={[styles.metaIcon, { backgroundColor: dark ? 'rgba(255,255,255,0.05)' : icon === 'map-pin' ? 'rgba(244,63,94,0.10)' : icon === 'clock' ? 'rgba(245,158,11,0.10)' : 'rgba(249,115,22,0.10)', borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.15)' }]}><NativeIcon name={icon} size={16} color={dark ? '#fbbf24' : icon === 'map-pin' ? '#f43f5e' : icon === 'clock' ? '#f59e0b' : '#f97316'} /></View>
      <View style={styles.metaCopy}><Text style={[styles.metaLabel, { color: palette.mutedText }]}>{label}</Text><Text numberOfLines={2} style={[styles.metaValue, { color: palette.text }]}>{value}</Text></View>
    </View>
  );
}

function EventHubComponent({ dark, initialEvents, trendingEvents, categoryData, initialQuery = '', onSelectEvent, onCategoriesLayout }: EventHubProps) {
  const palette = dark ? colors.dark : colors.light;
  const categories = useMemo(() => normalizeCategories(categoryData), [categoryData]);
  const [timeline, setTimeline] = useState<TimelineFilter>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [pricing, setPricing] = useState<PricingFilter>('ALL');
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [events, setEvents] = useState(sortUpcoming(initialEvents));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialEvents.length >= PAGE_SIZE);
  const [trending, setTrending] = useState(false);
  const previousFilters = useRef<{ timeline: TimelineFilter; date: string; category: string; subcategory: string }>({ timeline: 'all', date: '', category: 'all', subcategory: '' });
  const sectionOffset = useRef(0);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => { if (initialQuery !== undefined) setQuery(initialQuery); }, [initialQuery]);

  const filterParams = useMemo(() => ({
    ...(category !== 'all' ? { category_id: category } : {}),
    ...(subcategory ? { subcategory_id: subcategory } : {}),
    ...(pricing !== 'ALL' && !trending ? { pricing_type: pricing } : {}),
    ...(timeline !== 'all' && !trending ? { timeline: timeline === 'date' ? undefined : timeline, date: timeline === 'date' ? selectedDate : undefined } : {}),
  }), [category, subcategory, pricing, timeline, selectedDate, trending]);

  const load = useCallback(async (offset: number, append: boolean, search = debouncedQuery) => {
    const id = ++requestId.current;
    if (append) setLoadingMore(true); else setLoading(true);
    setErrorMessage(null);
    const result = search.trim().length >= 2
      ? await api.searchEvents(search, { ...filterParams, limit: PAGE_SIZE, offset, event_name_only: true })
      : await api.getEventFeed({ ...filterParams, limit: PAGE_SIZE, offset });
    if (id !== requestId.current) return;
    if (result.data) {
      const incoming = sortUpcoming(result.data.filter((event) => event.status !== 'CANCELLED' && !event.deleted_at));
      setEvents((current) => {
        if (!append) return incoming;
        const seen = new Set(current.map((event) => event.id));
        return sortUpcoming([...current, ...incoming.filter((event) => !seen.has(event.id))]);
      });
      setHasMore(result.data.length >= PAGE_SIZE);
    } else {
      setErrorMessage(result.error.message);
    }
    setLoading(false); setLoadingMore(false);
  }, [debouncedQuery, filterParams]);

  useEffect(() => {
    if (trending) {
      setEvents(sortUpcoming(trendingEvents));
      setHasMore(false);
      return;
    }
    void load(0, false);
  }, [load, trending, trendingEvents]);

  const visibleCategories = useMemo(() => {
    const clean = categoryQuery.trim().toLowerCase();
    return clean ? categories.filter((item) => item.name.toLowerCase().includes(clean) || item.key.toLowerCase().includes(clean) || item.subcategories?.some((child) => child.name.toLowerCase().includes(clean) || child.key.toLowerCase().includes(clean))) : categories;
  }, [categories, categoryQuery]);
  const activeCategory = categories.find((item) => item.id === category);
  const visibleSubcategories = activeCategory?.subcategories ?? [];
  const filteredEvents = useMemo(() => {
    const source = trending ? trendingEvents : events;
    const scoped = source.filter((event) => (pricing === 'ALL' || trending || event.pricing_type === pricing) && eventMatchesTimeline(event, timeline, selectedDate));
    return debouncedQuery.trim().length >= 2 && !trending ? rankEventNames(scoped, debouncedQuery) : sortUpcoming(scoped);
  }, [events, trendingEvents, trending, pricing, timeline, selectedDate, debouncedQuery]);
  const renderEvent = useCallback(({ item }: { item: EventFeedItem }) => (
    <EventCard event={item} dark={dark} onSelectEvent={onSelectEvent} />
  ), [dark, onSelectEvent]);

  const selectCategory = (id: string) => { setTrending(false); setCategory(id); if (id !== category) setSubcategory(''); };
  const selectTrending = () => {
    if (!trending) previousFilters.current = { timeline, date: selectedDate, category, subcategory };
    setTrending(true); setTimeline('all'); setSelectedDate(''); setCategory('all'); setSubcategory(''); setPricing('ALL'); setQuery('');
  };
  const leaveTrending = (nextPricing: PricingFilter) => {
    if (!trending) { setPricing(nextPricing); return; }
    setTrending(false); setTimeline(previousFilters.current.timeline); setSelectedDate(previousFilters.current.date); setCategory(previousFilters.current.category); setSubcategory(previousFilters.current.subcategory); setPricing(nextPricing);
  };
  const chooseDate = () => { setTrending(false); setTimeline('date'); setSelectedDate(localDate(new Date())); };

  return (
    <View style={styles.section} onLayout={(event) => { sectionOffset.current = event.nativeEvent.layout.y; }}>
      <View style={[styles.filterPanel, { backgroundColor: 'transparent', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.72)' }]}>
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%"><LinearGradient id="filter-panel-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor={dark ? 'rgba(28,30,40,0.78)' : 'rgba(255,255,255,0.70)'} /><Stop offset="55%" stopColor={dark ? 'rgba(28,30,40,0.70)' : 'rgba(255,255,255,0.62)'} /><Stop offset="100%" stopColor={dark ? 'rgba(28,30,40,0.76)' : 'rgba(255,255,255,0.68)'} /></LinearGradient><SvgRect width="100%" height="100%" fill="url(#filter-panel-gradient)" /></Svg>
        <FilterTier dark={dark} icon="clock" title="Schedule">
          <ScrollChips values={timelineOptions.map((item) => [item[0], item[1]] as const)} selected={timeline} onSelect={(value) => value === 'date' ? chooseDate() : (setTrending(false), setTimeline(value as TimelineFilter), setSelectedDate(''))} dark={dark} />
          {timeline === 'date' && !trending ? <TextInput value={selectedDate} onChangeText={setSelectedDate} placeholder="YYYY-MM-DD" placeholderTextColor={palette.mutedText} style={[styles.dateInput, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.outline }]} accessibilityLabel="Filter by date" /> : null}
        </FilterTier>
        <View style={styles.divider} />
        <FilterTier dark={dark} icon="ticket" title="Event Type">
          <ScrollChips values={[['ALL', 'All'], ['FREE', 'Free'], ['PAID', 'Paid'], ['TRENDING', 'Trending']] as const} selected={trending ? 'TRENDING' : pricing} onSelect={(value) => value === 'TRENDING' ? selectTrending() : leaveTrending(value as PricingFilter)} dark={dark} />
        </FilterTier>
        <View style={styles.divider} />
        <View style={styles.tier} onLayout={(event) => onCategoriesLayout?.(sectionOffset.current + event.nativeEvent.layout.y)}>
          <View style={styles.tierHeader}><View style={styles.tierTitle}><View style={styles.tierIcon}><NativeIcon name="sparkles" size={14} color={palette.text} /></View><Text style={[styles.tierLabel, { color: palette.text }]}>CATEGORIES</Text></View><View style={styles.categorySearchWrap}><NativeIcon name="search" size={14} color={palette.mutedText} /><TextInput value={categoryQuery} onChangeText={setCategoryQuery} placeholder="Search categories..." placeholderTextColor={palette.mutedText} style={[styles.categorySearch, { color: palette.text }]} accessibilityLabel="Search categories" /></View></View>
          <ScrollChips values={[['all', 'All'], ...visibleCategories.map((item) => [item.id, item.name] as [string, string])]} selected={category} onSelect={selectCategory} dark={dark} categoryData={categories} />
          {category !== 'all' && visibleSubcategories.length ? <ScrollChips values={[['', 'All subcategories'], ...visibleSubcategories.map((item) => [item.id, item.name] as [string, string])]} selected={subcategory} onSelect={(value) => { setTrending(false); setSubcategory(value); }} dark={dark} /> : null}
        </View>
      </View>
      <View style={styles.hubHeading}><View style={styles.headingLine}><View style={styles.diamond} /></View><Text style={[styles.heading, { color: palette.text }]}>Event <Text style={styles.accent}>Hub</Text></Text><View style={[styles.headingLine, styles.headingLineRight]}><View style={styles.diamond} /></View></View>
      {loading ? <Skeleton dark={dark} /> : null}
      {errorMessage && !events.length ? <View style={styles.state}><Text style={[styles.stateText, { color: palette.text }]}>{errorMessage}</Text><Pressable onPress={() => void load(0, false)}><Text style={styles.retry}>Retry</Text></Pressable></View> : null}
      {!loading && !errorMessage && filteredEvents.length === 0 ? <View style={styles.state}><Text style={[styles.stateText, { color: palette.text }]}>No events found</Text><Text style={{ color: palette.mutedText }}>Try changing your filters or search.</Text></View> : null}
      <FlatList
        data={filteredEvents}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
      {hasMore && !trending && !loading && filteredEvents.length ? <Pressable style={styles.more} onPress={() => void load(events.length, true)} disabled={loadingMore}><Text style={styles.moreText}>{loadingMore ? 'Loading…' : 'Show More'}</Text></Pressable> : null}
    </View>
  );
}

function ScrollChips({ values, selected, onSelect, dark, categoryData = [] }: { values: readonly (readonly [string, string])[]; selected: string; onSelect: (value: string) => void; dark: boolean; categoryData?: CategoryFeedItem[] }) {
  const palette = dark ? colors.dark : colors.light;
  const iconFor = (value: string): IconName | null => {
    if (value === 'all' || value === 'ALL') return 'layout-grid';
    if (value === 'today') return 'calendar';
    if (value === 'tomorrow' || value === 'date') return 'calendar-days';
    if (value === 'this_week') return 'calendar-range';
    if (value === 'TRENDING') return 'flame';
    if (value === 'FREE') return 'sparkles';
    if (value === 'PAID') return 'ticket';
    const category = categoryData.find((item) => item.id === value);
    if (category) {
      const key = category.key.toLowerCase();
      if (key.includes('academic')) return 'calendar';
      if (key.includes('cultur')) return 'sparkles';
      if (key.includes('innovat') || key.includes('tech')) return 'sparkles';
      if (key.includes('entrepreneur') || key.includes('business')) return 'ticket';
      if (key.includes('communit') || key.includes('health')) return 'flame';
      if (key.includes('club') || key.includes('org')) return 'layout-grid';
      return 'calendar-days';
    }
    return null;
  };
  return <FlatList horizontal data={values} showsHorizontalScrollIndicator={false} keyExtractor={(item) => item[0]} contentContainerStyle={styles.chips} renderItem={({ item }) => {
    const icon = iconFor(item[0]);
    const category = categoryData.find((entry) => entry.id === item[0]);
    const isCategory = Boolean(category) || (item[0] === 'all' && categoryData.length > 0);
    return <Pressable onPress={() => onSelect(item[0])} style={[styles.chip, { flexDirection: 'row', backgroundColor: isCategory && item[0] === selected ? '#0f172a' : item[0] === selected ? '#ea580c' : 'rgba(255,255,255,0.86)', borderColor: item[0] === selected ? (isCategory ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.65)') : 'rgba(255,255,255,0.95)' }]}>
      {item[0] === 'today' ? <View style={styles.todayDot} /> : icon && (isCategory || item[0] === 'TRENDING') ? <NativeIcon name={icon} size={14} color={item[0] === selected ? '#fff' : palette.variantText} /> : null}
      <Text style={[styles.chipLabel, { color: item[0] === selected ? '#fff' : palette.variantText }]}>{item[1]}</Text>
      {category && (category.subcategories?.length ?? 0) > 0 ? <View style={[styles.countBadge, { backgroundColor: item[0] === selected ? 'rgba(255,255,255,0.20)' : 'rgba(15,23,42,0.06)' }]}><Text style={{ color: item[0] === selected ? '#fff' : palette.variantText, fontSize: 9, lineHeight: 13, fontWeight: '900' }}>{category.subcategories?.length}</Text></View> : null}
    </Pressable>;
  }} />; 
}

function Skeleton({ dark }: { dark: boolean }) { const palette = dark ? colors.dark : colors.light; return <View style={styles.skeleton}><View style={[styles.skeletonImage, { backgroundColor: palette.surface2 }]} /><View style={[styles.skeletonLine, { backgroundColor: palette.surface2 }]} /><View style={[styles.skeletonLineSmall, { backgroundColor: palette.surface2 }]} /></View>; }

export const EventHub = memo(EventHubComponent);

const styles = StyleSheet.create({
  section: { marginHorizontal: spacing.gutter, marginTop: spacing.section },
  heading: { fontFamily: typography.headingFamily, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  accent: { color: '#f97316' },
  filterPanel: { marginTop: spacing.section, marginHorizontal: 4, borderRadius: 28, borderWidth: 1.5, overflow: 'hidden', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.10, shadowRadius: 28, elevation: 5 },
  tier: { paddingHorizontal: 16, paddingVertical: 15, gap: 10 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  tierTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  tierIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.70)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.90)', alignItems: 'center', justifyContent: 'center' },
  tierIconText: { color: '#0f172a', fontSize: 13, fontWeight: '900' },
  tierLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  categorySearchWrap: { flex: 1, maxWidth: 185, height: 34, borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.80)', backgroundColor: 'rgba(255,255,255,0.60)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 5 },
  categorySearch: { flex: 1, height: 32, padding: 0, fontSize: 11 },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.58)' },
  hubHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.lg },
  headingLine: { flex: 1, height: 1, backgroundColor: 'rgba(148,163,184,0.45)', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  headingLineRight: { justifyContent: 'flex-start' },
  diamond: { width: 7, height: 7, transform: [{ rotate: '45deg' }], backgroundColor: 'rgba(249,115,22,0.20)', borderWidth: 1, borderColor: '#f97316' },
  dateInput: { height: 38, borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  chips: { gap: 6, paddingVertical: 2, paddingHorizontal: 2, alignItems: 'center' },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 1 },
  chipLabel: { fontSize: 11.5, lineHeight: 14, fontWeight: '800', includeFontPadding: false, textAlignVertical: 'center' },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399', shadowColor: '#34d399', shadowOpacity: 0.8, shadowRadius: 4 },
  countBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', ...shadows.glass },
  cardSurface: { flex: 1, overflow: 'hidden' },
  poster: { width: '100%', aspectRatio: 16 / 9, backgroundColor: 'rgba(100,116,139,0.08)', alignItems: 'center', justifyContent: 'center' },
  posterImage: { width: '100%', height: '100%' },
  posterShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.12)' },
  category: { position: 'absolute', bottom: spacing.sm, left: spacing.sm, color: '#fff', fontSize: 10, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.pill },
  trending: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ea580c', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.pill },
  trendingText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  body: { padding: 14, gap: spacing.xs },
  name: { fontSize: 16, lineHeight: 21, fontWeight: '900', marginBottom: 8 },
  metadata: { gap: 9, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  metaIconText: { fontSize: 16, fontWeight: '900' },
  metaCopy: { flex: 1, gap: 1 },
  metaLabel: { fontSize: 8, lineHeight: 10, fontWeight: '900', letterSpacing: 1.1 },
  metaValue: { fontSize: 12, lineHeight: 16, fontWeight: '900' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  price: { fontSize: 11, fontWeight: '900' },
  detailsButton: { backgroundColor: '#ff6b00', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,164,92,0.55)', shadowColor: '#f97316', shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  details: { color: '#fff', fontSize: 11, fontWeight: '800' },
  more: { alignSelf: 'center', marginTop: spacing.lg, backgroundColor: '#f97316', borderRadius: radii.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  moreText: { color: '#fff', fontWeight: '900' },
  state: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  stateText: { fontSize: 16, fontWeight: '800' },
  retry: { color: '#ea580c', fontWeight: '900' },
  skeleton: { marginTop: spacing.md, borderRadius: radii.xl, overflow: 'hidden', gap: spacing.sm },
  skeletonImage: { height: 190, borderRadius: radii.xl },
  skeletonLine: { height: 20, width: '75%', borderRadius: radii.xs },
  skeletonLineSmall: { height: 14, width: '45%', borderRadius: radii.xs, marginBottom: spacing.md },
});

function FilterTier({ dark, icon, title, children }: { dark: boolean; icon: IconName; title: string; children: React.ReactNode }) {
  const palette = dark ? colors.dark : colors.light;
  return <View style={styles.tier}><View style={styles.tierTitle}><View style={styles.tierIcon}><NativeIcon name={icon} size={14} color={palette.text} /></View><Text style={[styles.tierLabel, { color: palette.text }]}>{title.toUpperCase()}</Text></View>{children}</View>;
}
