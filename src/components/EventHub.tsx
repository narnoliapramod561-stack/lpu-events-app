import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { LinearGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import type { CategoryFeedItem, EventFeedItem } from '../api/types';
import { PublicApiClient } from '../api/publicApi';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import {
  eventMatchesTimeline,
  formatEventDateRange,
  localDate,
  normalizeCategories,
  rankEventNames,
  sortUpcoming,
  type PricingFilter,
  type TimelineFilter,
} from '../features/eventHub';
import { NativeIcon, type IconName } from './NativeIcon';

const api = new PublicApiClient();
const PAGE_SIZE = 9;
const timelineOptions: Array<[TimelineFilter, string]> = [
  ['all', 'All Events'],
  ['today', 'Today'],
  ['tomorrow', 'Tomorrow'],
  ['this_week', 'This Week'],
  ['date', 'Pick Date'],
];

interface EventHubProps {
  dark: boolean;
  initialEvents: EventFeedItem[];
  trendingEvents: EventFeedItem[];
  categoryData: unknown;
  initialQuery?: string;
  onSelectEvent: (id: string) => void;
  onCategoriesLayout?: (y: number) => void;
  forcedTimeline?: TimelineFilter;
}

const getCategoryIcon = (keyOrName: string): IconName => {
  const lower = (keyOrName || '').toLowerCase();
  if (lower.includes('academic') || lower.includes('seminar') || lower.includes('lecture') || lower.includes('intern') || lower.includes('capstone')) return 'graduation-cap';
  if (lower.includes('cultur') || lower.includes('music') || lower.includes('dance') || lower.includes('theatre') || lower.includes('social media')) return 'sparkles';
  if (lower.includes('innovat') || lower.includes('tech') || lower.includes('coding') || lower.includes('hack') || lower.includes('expo')) return 'lightbulb';
  if (lower.includes('entrepreneur') || lower.includes('b-plan') || lower.includes('pitch') || lower.includes('conclave') || lower.includes('bootcamp') || lower.includes('business')) return 'briefcase';
  if (lower.includes('communit') || lower.includes('donation') || lower.includes('environ') || lower.includes('health')) return 'heart';
  if (lower.includes('co-curricular') || lower.includes('skill') || lower.includes('certif') || lower.includes('train') || lower.includes('compet')) return 'award';
  if (lower.includes('club') || lower.includes('org')) return 'users';
  return 'layout-grid';
};

const EventCard = memo(
  ({
    event,
    dark,
    onSelectEvent,
  }: {
    event: EventFeedItem;
    dark: boolean;
    onSelectEvent: (id: string) => void;
  }) => {
    const palette = dark ? colors.dark : colors.light;
    const start = new Date(event.start_at);
    const timeFormatted = Number.isNaN(start.getTime())
      ? 'Time TBA'
      : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const categoryName = (event.categories?.name || 'CAMPUS EVENT').toUpperCase();
    const orgName = event.organizations?.name || 'LPU Organization';

    return (
      <Pressable
        onPress={() => onSelectEvent(event.id)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${event.name}`}
        style={[
          styles.card,
          {
            backgroundColor: dark ? 'rgba(26,26,32,0.92)' : 'rgba(255,255,255,0.92)',
            borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
          },
        ]}
      >
        {/* Event Cover Image */}
        <View style={styles.poster}>
          <Image
            source={eventImageSource(event) ?? undefined}
            resizeMode="contain"
            style={styles.posterImage}
          />
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
            <LinearGradient id={`card-grad-${event.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <Stop offset="50%" stopColor="transparent" stopOpacity="0" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0.65)" stopOpacity="1" />
            </LinearGradient>
            <SvgRect width="100%" height="100%" fill={`url(#card-grad-${event.id})`} />
          </Svg>

          {/* Trending Badge */}
          {event.is_trending ? (
            <View style={styles.trendingBadge}>
              <View style={styles.trendingDot} />
              <Text style={styles.trendingText}>🔥 Trending</Text>
            </View>
          ) : null}

          {/* Category Pill on Image */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryName}</Text>
          </View>
        </View>

        {/* Event Body */}
        <View style={styles.body}>
          <Text
            numberOfLines={2}
            style={[styles.name, { color: dark ? '#ffffff' : '#c2410c' }]}
          >
            {event.name}
          </Text>

          {/* Metadata Stack: Date, Schedule, Venue */}
          <View style={styles.metadata}>
            <MetaRow
              icon="calendar"
              label="DATE"
              value={formatEventDateRange(event.start_at, event.end_at)}
              dark={dark}
              accent="#ea580c"
            />
            <MetaRow
              icon="clock"
              label="SCHEDULE"
              value={timeFormatted}
              dark={dark}
              accent="#f59e0b"
            />
            <MetaRow
              icon="map-pin"
              label="VENUE"
              value={event.venue_name || 'LPU Campus'}
              dark={dark}
              accent="#f43f5e"
            />
          </View>

          {/* Footer: Organization & View Details */}
          <View
            style={[
              styles.cardFooter,
              { borderTopColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(148,163,184,0.22)' },
            ]}
          >
            <View style={styles.orgWrap}>
              <Text style={[styles.orgLabel, { color: palette.mutedText }]}>
                By <Text style={[styles.orgName, { color: palette.text }]}>{orgName}</Text>
              </Text>
            </View>
            <View style={styles.detailsButton}>
              <Text style={styles.detailsText}>View Details</Text>
              <NativeIcon name="arrow-right" size={12} color="#ffffff" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
);

function MetaRow({
  icon,
  label,
  value,
  dark,
  accent,
}: {
  icon: IconName;
  label: string;
  value: string;
  dark: boolean;
  accent: string;
}) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.metaRow}>
      <View
        style={[
          styles.metaIcon,
          {
            backgroundColor: dark ? 'rgba(255,255,255,0.06)' : `${accent}18`,
            borderColor: dark ? 'rgba(255,255,255,0.10)' : `${accent}30`,
          },
        ]}
      >
        <NativeIcon name={icon} size={15} color={dark ? '#fbbf24' : accent} />
      </View>
      <View style={styles.metaCopy}>
        <Text style={[styles.metaLabel, { color: palette.mutedText }]}>{label}</Text>
        <Text numberOfLines={1} style={[styles.metaValue, { color: palette.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function EventHubComponent({
  dark,
  initialEvents,
  trendingEvents,
  categoryData,
  initialQuery = '',
  onSelectEvent,
  onCategoriesLayout,
  forcedTimeline,
}: EventHubProps) {
  const palette = dark ? colors.dark : colors.light;
  const categories = useMemo(() => normalizeCategories(categoryData), [categoryData]);
  const [timeline, setTimeline] = useState<TimelineFilter>(forcedTimeline || 'all');
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
  const previousFilters = useRef<{
    timeline: TimelineFilter;
    date: string;
    category: string;
    subcategory: string;
  }>({ timeline: 'all', date: '', category: 'all', subcategory: '' });
  const sectionOffset = useRef(0);
  const requestId = useRef(0);

  useEffect(() => {
    if (forcedTimeline) {
      setTimeline(forcedTimeline);
    }
  }, [forcedTimeline]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

  const filterParams = useMemo(
    () => ({
      ...(category !== 'all' ? { category_id: category } : {}),
      ...(subcategory ? { subcategory_id: subcategory } : {}),
      ...(pricing !== 'ALL' && !trending ? { pricing_type: pricing } : {}),
      ...(timeline !== 'all' && !trending
        ? {
            timeline: timeline === 'date' ? undefined : timeline,
            date: timeline === 'date' ? selectedDate : undefined,
          }
        : {}),
    }),
    [category, subcategory, pricing, timeline, selectedDate, trending],
  );

  const load = useCallback(
    async (offset: number, append: boolean, search = debouncedQuery) => {
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setErrorMessage(null);
      const result =
        search.trim().length >= 2
          ? await api.searchEvents(search, {
              ...filterParams,
              limit: PAGE_SIZE,
              offset,
              event_name_only: true,
            })
          : await api.getEventFeed({ ...filterParams, limit: PAGE_SIZE, offset });
      if (id !== requestId.current) return;
      if (result.data) {
        const incoming = sortUpcoming(
          result.data.filter((evt) => evt.status !== 'CANCELLED' && !evt.deleted_at),
        );
        setEvents((current) => {
          if (!append) return incoming;
          const seen = new Set(current.map((evt) => evt.id));
          return sortUpcoming([...current, ...incoming.filter((evt) => !seen.has(evt.id))]);
        });
        setHasMore(result.data.length >= PAGE_SIZE);
      } else {
        setErrorMessage(result.error.message);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [debouncedQuery, filterParams],
  );

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
    if (!clean) return categories;
    return categories.filter(
      (item) =>
        item.name.toLowerCase().includes(clean) ||
        item.key.toLowerCase().includes(clean) ||
        item.subcategories?.some(
          (child) =>
            child.name.toLowerCase().includes(clean) || child.key.toLowerCase().includes(clean),
        ),
    );
  }, [categories, categoryQuery]);

  const activeCategory = categories.find((item) => item.id === category);
  const visibleSubcategories = activeCategory?.subcategories ?? [];

  const filteredEvents = useMemo(() => {
    const source = trending ? trendingEvents : events;
    const scoped = source.filter(
      (evt) =>
        (pricing === 'ALL' || trending || evt.pricing_type === pricing) &&
        eventMatchesTimeline(evt, timeline, selectedDate),
    );
    return debouncedQuery.trim().length >= 2 && !trending
      ? rankEventNames(scoped, debouncedQuery)
      : sortUpcoming(scoped);
  }, [events, trendingEvents, trending, pricing, timeline, selectedDate, debouncedQuery]);

  const renderEvent = useCallback(
    ({ item }: { item: EventFeedItem }) => (
      <EventCard event={item} dark={dark} onSelectEvent={onSelectEvent} />
    ),
    [dark, onSelectEvent],
  );

  const selectCategory = (id: string) => {
    setTrending(false);
    setCategory(id);
    if (id !== category) setSubcategory('');
  };

  const selectTrending = () => {
    if (!trending) {
      previousFilters.current = { timeline, date: selectedDate, category, subcategory };
    }
    setTrending(true);
    setTimeline('all');
    setSelectedDate('');
    setCategory('all');
    setSubcategory('');
    setPricing('ALL');
    setQuery('');
  };

  const leaveTrending = (nextPricing: PricingFilter) => {
    if (!trending) {
      setPricing(nextPricing);
      return;
    }
    setTrending(false);
    setTimeline(previousFilters.current.timeline);
    setSelectedDate(previousFilters.current.date);
    setCategory(previousFilters.current.category);
    setSubcategory(previousFilters.current.subcategory);
    setPricing(nextPricing);
  };

  const chooseDate = () => {
    setTrending(false);
    setTimeline('date');
    setSelectedDate(localDate(new Date()));
  };

  const handleResetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setTrending(false);
    setCategory('all');
    setSubcategory('');
    setTimeline('all');
    setSelectedDate('');
    setPricing('ALL');
  };

  const sectionTitle = debouncedQuery.trim().length >= 2
    ? 'Search Results'
    : trending
    ? '🔥 Trending Events'
    : 'Event Hub';

  return (
    <View
      style={styles.section}
      onLayout={(e) => {
        sectionOffset.current = e.nativeEvent.layout.y;
      }}
    >
      {/* 3-Tier Filter Card */}
      <View
        style={[
          styles.filterPanel,
          {
            backgroundColor: dark ? 'rgba(26,26,32,0.92)' : 'rgba(255,255,255,0.92)',
            borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
          },
        ]}
      >
        {/* Tier 1: Schedule */}
        <FilterTier dark={dark} icon="clock" title="Schedule">
          <ScrollChips
            values={timelineOptions.map((item) => [item[0], item[1]] as const)}
            selected={timeline}
            onSelect={(val) =>
              val === 'date'
                ? chooseDate()
                : (setTrending(false), setTimeline(val as TimelineFilter), setSelectedDate(''))
            }
            dark={dark}
          />
          {timeline === 'date' && !trending ? (
            <TextInput
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.mutedText}
              style={[
                styles.dateInput,
                {
                  color: palette.text,
                  backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: palette.outline,
                },
              ]}
              accessibilityLabel="Filter by date"
            />
          ) : null}
        </FilterTier>

        <View style={styles.divider} />

        {/* Tier 2: Event Type */}
        <FilterTier dark={dark} icon="ticket" title="Event Type">
          <ScrollChips
            values={
              [
                ['ALL', 'All Events'],
                ['FREE', 'Free Events'],
                ['PAID', 'Paid Events'],
                ['TRENDING', '🔥 Trending'],
              ] as const
            }
            selected={trending ? 'TRENDING' : pricing}
            onSelect={(val) =>
              val === 'TRENDING' ? selectTrending() : leaveTrending(val as PricingFilter)
            }
            dark={dark}
          />
        </FilterTier>

        <View style={styles.divider} />

        {/* Tier 3: Categories & Subcategories */}
        <View
          style={styles.tier}
          onLayout={(e) => onCategoriesLayout?.(sectionOffset.current + e.nativeEvent.layout.y)}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierTitle}>
              <View style={styles.tierIcon}>
                <NativeIcon name="sparkles" size={13} color="#ea580c" />
              </View>
              <Text style={[styles.tierLabel, { color: palette.text }]}>CATEGORIES</Text>
            </View>
            <View
              style={[
                styles.categorySearchWrap,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: palette.outline,
                },
              ]}
            >
              <NativeIcon name="search" size={13} color={palette.mutedText} />
              <TextInput
                value={categoryQuery}
                onChangeText={setCategoryQuery}
                placeholder="Search categories..."
                placeholderTextColor={palette.mutedText}
                style={[styles.categorySearch, { color: palette.text }]}
                accessibilityLabel="Search categories"
              />
            </View>
          </View>

          {/* Category Chips */}
          <ScrollChips
            values={[
              ['all', 'All Categories'],
              ...visibleCategories.map((item) => [item.id, item.name] as [string, string]),
            ]}
            selected={category}
            onSelect={selectCategory}
            dark={dark}
            categoryData={categories}
          />

          {/* Subcategories row when category selected */}
          {category !== 'all' && visibleSubcategories.length ? (
            <ScrollChips
              values={[
                ['', `All ${activeCategory?.name || 'Subcategories'}`],
                ...visibleSubcategories.map((item) => [item.id, item.name] as [string, string]),
              ]}
              selected={subcategory}
              onSelect={(val) => {
                setTrending(false);
                setSubcategory(val);
              }}
              dark={dark}
            />
          ) : null}
        </View>
      </View>

      {/* Section Header with Gradient Lines and Diamond Accents */}
      <View style={styles.hubHeading}>
        <View style={styles.headingLine}>
          <View style={styles.diamond} />
        </View>
        <Text style={[styles.heading, { color: palette.text }]}>
          {sectionTitle === 'Event Hub' ? (
            <>
              Event <Text style={styles.accent}>Hub</Text>
            </>
          ) : (
            sectionTitle
          )}
        </Text>
        <View style={[styles.headingLine, styles.headingLineRight]}>
          <View style={styles.diamond} />
        </View>
      </View>

      {loading ? <Skeleton dark={dark} /> : null}

      {/* Error State */}
      {errorMessage && !events.length ? (
        <View style={styles.state}>
          <Text style={[styles.stateText, { color: palette.text }]}>{errorMessage}</Text>
          <Pressable onPress={() => void load(0, false)} style={styles.retryBtn}>
            <NativeIcon name="refresh" size={14} color="#ffffff" />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Empty State */}
      {!loading && !errorMessage && filteredEvents.length === 0 ? (
        <View style={styles.state}>
          <View style={styles.emptyIconCircle}>
            <NativeIcon name="search" size={26} color="#ea580c" />
          </View>
          <Text style={[styles.stateText, { color: palette.text }]}>No Events Found</Text>
          <Text style={[styles.stateDesc, { color: palette.mutedText }]}>
            {debouncedQuery
              ? `We couldn't find any events matching "${debouncedQuery}". Try another keyword or reset filters.`
              : 'No events match your selected filters. Check back soon or reset filters.'}
          </Text>
          <Pressable onPress={handleResetFilters} style={styles.resetBtn}>
            <NativeIcon name="refresh" size={14} color="#ffffff" />
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Event Cards FlatList */}
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

      {/* View More Events Button */}
      {hasMore && !trending && !loading && filteredEvents.length ? (
        <Pressable
          style={styles.moreButton}
          onPress={() => void load(events.length, true)}
          disabled={loadingMore}
        >
          <Text style={styles.moreText}>{loadingMore ? 'Loading…' : 'View More Events'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ScrollChips({
  values,
  selected,
  onSelect,
  dark,
  categoryData = [],
}: {
  values: readonly (readonly [string, string])[];
  selected: string;
  onSelect: (value: string) => void;
  dark: boolean;
  categoryData?: CategoryFeedItem[];
}) {
  const palette = dark ? colors.dark : colors.light;

  const iconFor = (val: string): IconName | null => {
    if (val === 'all' || val === 'ALL') return 'layout-grid';
    if (val === 'today') return 'calendar';
    if (val === 'tomorrow' || val === 'date') return 'calendar-days';
    if (val === 'this_week') return 'calendar-range';
    if (val === 'TRENDING') return 'flame';
    if (val === 'FREE') return 'sparkles';
    if (val === 'PAID') return 'ticket';
    const cat = categoryData.find((item) => item.id === val);
    if (cat) return getCategoryIcon(cat.key || cat.name);
    return null;
  };

  return (
    <FlatList
      horizontal
      data={values}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item[0]}
      contentContainerStyle={styles.chips}
      renderItem={({ item }) => {
        const icon = iconFor(item[0]);
        const cat = categoryData.find((entry) => entry.id === item[0]);
        const isSelected = item[0] === selected;

        return (
          <Pressable
            onPress={() => onSelect(item[0])}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? '#ea580c'
                  : dark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.85)',
                borderColor: isSelected
                  ? '#ea580c'
                  : dark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(226,232,240,0.95)',
              },
            ]}
          >
            {item[0] === 'today' ? <View style={styles.todayDot} /> : null}
            {icon && item[0] !== 'today' ? (
              <NativeIcon
                name={icon}
                size={13}
                color={isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#475569'}
              />
            ) : null}
            <Text
              style={[
                styles.chipLabel,
                { color: isSelected ? '#ffffff' : dark ? '#e2e8f0' : '#1e293b' },
              ]}
            >
              {item[1]}
            </Text>
            {cat && (cat.subcategories?.length ?? 0) > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : dark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(15,23,42,0.08)',
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? '#ffffff' : palette.variantText,
                    fontSize: 9,
                    fontWeight: '900',
                  }}
                >
                  {cat.subcategories?.length}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

function FilterTier({
  dark,
  icon,
  title,
  children,
}: {
  dark: boolean;
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.tier}>
      <View style={styles.tierTitle}>
        <View style={styles.tierIcon}>
          <NativeIcon name={icon} size={13} color="#ea580c" />
        </View>
        <Text style={[styles.tierLabel, { color: palette.text }]}>{title.toUpperCase()}</Text>
      </View>
      {children}
    </View>
  );
}

function Skeleton({ dark }: { dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.skeleton}>
      <View style={[styles.skeletonImage, { backgroundColor: palette.surface2 }]} />
      <View style={[styles.skeletonLine, { backgroundColor: palette.surface2 }]} />
      <View style={[styles.skeletonLineSmall, { backgroundColor: palette.surface2 }]} />
    </View>
  );
}

export const EventHub = memo(EventHubComponent);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.section,
  },
  heading: {
    fontFamily: typography.headingFamily,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  accent: {
    color: '#ff6b00',
  },
  filterPanel: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.glass,
  },
  tier: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tierTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'rgba(255,107,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  categorySearchWrap: {
    flex: 1,
    maxWidth: 180,
    height: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  categorySearch: {
    flex: 1,
    height: 30,
    padding: 0,
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(148,163,184,0.18)',
  },
  hubHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  headingLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headingLineRight: {
    justifyContent: 'flex-start',
  },
  diamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255,107,0,0.30)',
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  dateInput: {
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  chips: {
    gap: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  countBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.glass,
  },
  poster: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(100,116,139,0.08)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ea580c',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radii.pill,
  },
  trendingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffffff',
  },
  trendingText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radii.pill,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  body: {
    padding: 16,
    gap: 10,
  },
  name: {
    fontFamily: typography.headingFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  metadata: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCopy: {
    flex: 1,
    gap: 1,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  orgWrap: {
    flex: 1,
    marginRight: 8,
  },
  orgLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  orgName: {
    fontWeight: '900',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ff6b00',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#f97316',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  detailsText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    backgroundColor: '#ff6b00',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    shadowColor: '#f97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  moreText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  state: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,107,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateText: {
    fontSize: 17,
    fontWeight: '900',
  },
  stateDesc: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#ff6b00',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#ff6b00',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  skeleton: {
    marginTop: spacing.md,
    borderRadius: radii.xl,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  skeletonImage: {
    height: 190,
    borderRadius: radii.xl,
  },
  skeletonLine: {
    height: 20,
    width: '75%',
    borderRadius: radii.xs,
  },
  skeletonLineSmall: {
    height: 14,
    width: '45%',
    borderRadius: radii.xs,
    marginBottom: spacing.md,
  },
});
