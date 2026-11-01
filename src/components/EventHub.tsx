import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect as SvgRect,
  Stop,
} from 'react-native-svg';
import type { CategoryFeedItem, EventFeedItem } from '../api/types';
import { PublicApiClient } from '../api/publicApi';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import {
  formatDisplayDate,
  formatEventDateRange,
  formatEventTime,
  localDate,
  matchesScheduleFilter,
  normalizeCategories,
  rankEventNames,
  sortUpcoming,
  type PricingFilter,
  type TimelineFilter,
} from '../features/eventHub';
import { NativeIcon, type IconName } from './NativeIcon';

const api = new PublicApiClient();
const PAGE_SIZE = 9;

const timelineOptions: [TimelineFilter, string][] = [
  ['all', 'All'],
  ['today', 'Today'],
  ['tomorrow', 'Tomorrow'],
  ['this_week', 'This Week'],
  ['upcoming', 'Upcoming'],
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

// Map dynamic Lucide icons for official platform categories and subcategories matching student website
export const getCategoryIcon = (keyOrName: string): IconName => {
  const lower = (keyOrName || '').toLowerCase();
  if (lower.includes('academic') || lower.includes('seminar') || lower.includes('lecture') || lower.includes('intern') || lower.includes('capstone')) return 'graduation-cap';
  if (lower.includes('cultur') || lower.includes('music') || lower.includes('dance') || lower.includes('theatre') || lower.includes('social media')) return 'sparkles';
  if (lower.includes('innovat') || lower.includes('tech') || lower.includes('coding') || lower.includes('hack') || lower.includes('expo')) return 'lightbulb';
  if (lower.includes('entrepreneur') || lower.includes('b-plan') || lower.includes('pitch') || lower.includes('conclave') || lower.includes('bootcamp') || lower.includes('business')) return 'briefcase';
  if (lower.includes('school') || lower.includes('eng') || lower.includes('design') || lower.includes('law')) return 'book-open';
  if (lower.includes('communit') || lower.includes('donation') || lower.includes('environ') || lower.includes('health')) return 'heart';
  if (lower.includes('day') || lower.includes('celebration') || lower.includes('national') || lower.includes('awareness')) return 'flag';
  if (lower.includes('co-curricular') || lower.includes('skill') || lower.includes('certif') || lower.includes('train') || lower.includes('compet')) return 'award';
  if (lower.includes('club') || lower.includes('org')) return 'users';
  if (lower.includes('ncc') || lower.includes('parade') || lower.includes('camp')) return 'shield';
  if (lower.includes('nss') || lower.includes('social work') || lower.includes('campaign')) return 'hand-heart';
  if (lower.includes('fashion') || lower.includes('show')) return 'shirt';
  if (lower.includes('other') || lower.includes('misc')) return 'more-horizontal';
  return 'layers';
};

function GradientBackground({
  id,
  from = '#ff802b',
  to = '#ea580c',
  borderRadius = 12,
}: {
  id: string;
  from?: string;
  to?: string;
  borderRadius?: number;
}) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={from} stopOpacity={1} />
            <Stop offset="100%" stopColor={to} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <SvgRect width="100%" height="100%" rx={borderRadius} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function HairlineDivider({ dark }: { dark: boolean }) {
  const gradId = dark ? 'hl-div-dark' : 'hl-div-light';
  return (
    <View style={styles.hairlineDividerWrap}>
      <Svg width="100%" height={1}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
            <Stop
              offset="50%"
              stopColor={dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.95)'}
              stopOpacity={1}
            />
            <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <SvgRect width="100%" height={1} fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

function PulsingLiveDot() {
  const [pulseAnim] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.liveDotWrap}>
      <Animated.View
        style={[
          styles.liveDotPing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.5],
              outputRange: [0.75, 0.15],
            }),
          },
        ]}
      />
      <View style={styles.liveDotInner} />
    </View>
  );
}

function FilterTier({
  dark,
  icon,
  title,
  showClear = false,
  onClear,
  headerRight,
  children,
}: {
  dark: boolean;
  icon: IconName;
  title: string;
  showClear?: boolean;
  onClear?: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.tier}>
      <View style={styles.tierHeader}>
        <View style={styles.tierTitle}>
          <View
            style={[
              styles.tierIcon,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.70)',
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.90)',
              },
            ]}
          >
            <NativeIcon name={icon} size={14} color={dark ? '#ffffff' : '#1e293b'} />
          </View>
          <Text style={[styles.tierLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
            {title.toUpperCase()}
          </Text>
        </View>

        {headerRight}

        {showClear && !headerRight ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${title} filter`}
            style={[
              styles.tierClearBtn,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)',
                borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)',
              },
            ]}
          >
            <NativeIcon name="x" size={11} color={dark ? '#cbd5e1' : '#475569'} />
            <Text style={[styles.tierClearText, { color: dark ? '#cbd5e1' : '#475569' }]}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

interface NativeDatePickerModalProps {
  visible: boolean;
  dark: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

function NativeDatePickerModal({
  visible,
  dark,
  selectedDate,
  onSelectDate,
  onClose,
}: NativeDatePickerModalProps) {
  const palette = dark ? colors.dark : colors.light;
  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => localDate(now), [now]);

  const tomorrowStr = useMemo(() => {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return localDate(t);
  }, [now]);

  const weekendStr = useMemo(() => {
    const day = now.getDay();
    const daysUntilSat = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
    const sat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat);
    return localDate(sat);
  }, [now]);

  const [monthOffset, setMonthOffset] = useState(0);

  const displayDate = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [now, monthOffset]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const monthLabel = useMemo(
    () => displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [displayDate],
  );

  const daysGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: ({ dayNumber: number; dateStr: string; isPast: boolean } | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      cells.push({ dayNumber: d, dateStr, isPast });
    }
    return cells;
  }, [year, month, todayStr]);

  const handleSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  const handleClear = () => {
    onSelectDate('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: dark ? '#1a1a24' : '#ffffff',
              borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(226,232,240,0.95)',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ gap: 2 }}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Filter by Date</Text>
              <Text style={[styles.modalSubtitle, { color: palette.mutedText }]}>
                Only today and future events are displayed
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <NativeIcon name="x" size={14} color={palette.mutedText} />
            </Pressable>
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.quickOptionsRow}>
            <Pressable
              onPress={() => handleSelect(todayStr)}
              style={[
                styles.quickOptionBtn,
                selectedDate === todayStr && styles.quickOptionBtnActive,
                { borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(226,232,240,0.9)' },
              ]}
            >
              <Text
                style={[
                  styles.quickOptionText,
                  { color: selectedDate === todayStr ? '#ea580c' : palette.text },
                ]}
              >
                Today
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelect(tomorrowStr)}
              style={[
                styles.quickOptionBtn,
                selectedDate === tomorrowStr && styles.quickOptionBtnActive,
                { borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(226,232,240,0.9)' },
              ]}
            >
              <Text
                style={[
                  styles.quickOptionText,
                  { color: selectedDate === tomorrowStr ? '#ea580c' : palette.text },
                ]}
              >
                Tomorrow
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelect(weekendStr)}
              style={[
                styles.quickOptionBtn,
                selectedDate === weekendStr && styles.quickOptionBtnActive,
                { borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(226,232,240,0.9)' },
              ]}
            >
              <Text
                style={[
                  styles.quickOptionText,
                  { color: selectedDate === weekendStr ? '#ea580c' : palette.text },
                ]}
              >
                This Weekend
              </Text>
            </Pressable>
          </View>

          {/* Month Navigator */}
          <View style={styles.monthNav}>
            <Pressable
              disabled={monthOffset <= 0}
              onPress={() => setMonthOffset((m) => Math.max(0, m - 1))}
              style={[styles.monthNavBtn, monthOffset <= 0 && { opacity: 0.3 }]}
            >
              <NativeIcon name="chevron-left" size={16} color={palette.text} />
            </Pressable>
            <Text style={[styles.monthNavTitle, { color: palette.text }]}>{monthLabel}</Text>
            <Pressable
              disabled={monthOffset >= 11}
              onPress={() => setMonthOffset((m) => m + 1)}
              style={styles.monthNavBtn}
            >
              <NativeIcon name="chevron-right" size={16} color={palette.text} />
            </Pressable>
          </View>

          {/* Day of week headers */}
          <View style={styles.weekHeader}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, idx) => (
              <Text key={idx} style={[styles.weekHeaderText, { color: palette.mutedText }]}>
                {d}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysGrid.map((item, idx) => {
              if (!item) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const isSelected = item.dateStr === selectedDate;
              const isCurrentDay = item.dateStr === todayStr;

              return (
                <Pressable
                  key={item.dateStr}
                  disabled={item.isPast}
                  onPress={() => handleSelect(item.dateStr)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isCurrentDay && !isSelected && styles.dayCellToday,
                    item.isPast && { opacity: 0.25 },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      {
                        color: isSelected
                          ? '#ffffff'
                          : isCurrentDay
                          ? '#ea580c'
                          : item.isPast
                          ? palette.mutedText
                          : palette.text,
                        fontWeight: isSelected || isCurrentDay ? '900' : '600',
                      },
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            {selectedDate ? (
              <Pressable onPress={handleClear} style={styles.modalClearBtn}>
                <Text style={styles.modalClearBtnText}>Clear Date</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} style={styles.modalDoneBtn}>
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const EventCard = memo(
  function EventCard({
    event,
    dark,
    onSelectEvent,
  }: {
    event: EventFeedItem;
    dark: boolean;
    onSelectEvent: (id: string) => void;
  }) {
    const palette = dark ? colors.dark : colors.light;
    const timeFormatted = formatEventTime(event.start_at) || 'Time TBA';
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
              <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
              <Stop offset="50%" stopColor="transparent" stopOpacity={0} />
              <Stop offset="100%" stopColor="rgba(0,0,0,0.65)" stopOpacity={1} />
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
EventCard.displayName = 'EventCard';

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
  const [datePickerVisible, setDatePickerVisible] = useState(false);
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

  // Synchronize initialEvents prop changes (updates on homepage pull-to-refresh)
  const [prevInitialEvents, setPrevInitialEvents] = useState(initialEvents);
  if (initialEvents !== prevInitialEvents) {
    setPrevInitialEvents(initialEvents);
    const valid = (initialEvents || []).filter((evt) => evt.status !== 'CANCELLED' && !evt.deleted_at);
    setEvents(sortUpcoming(valid));
    setHasMore(valid.length >= PAGE_SIZE);
  }

  // Synchronize forcedTimeline prop changes
  const [prevForcedTimeline, setPrevForcedTimeline] = useState(forcedTimeline);
  if (forcedTimeline && forcedTimeline !== prevForcedTimeline) {
    setPrevForcedTimeline(forcedTimeline);
    setTimeline(forcedTimeline);
    setSelectedDate('');
  }

  // Synchronize initialQuery prop changes
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== undefined && initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // If homepage was refreshed while user had filters active, re-query the filtered feed
  useEffect(() => {
    if (category !== 'all' || subcategory || pricing !== 'ALL' || selectedDate || debouncedQuery.trim().length >= 2) {
      void load(0, false);
    }
  }, [initialEvents]);

  const filterParams = useMemo(
    () => ({
      ...(category !== 'all' ? { category_id: category } : {}),
      ...(subcategory ? { subcategory_id: subcategory } : {}),
      ...(pricing !== 'ALL' && !trending ? { pricing_type: pricing } : {}),
      ...(selectedDate && !trending
        ? { date: selectedDate }
        : timeline !== 'all' && !trending
        ? { timeline }
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
    if (!trending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load(0, false);
    }
  }, [load, trending]);

  // In-memory zero-database-stress taxonomy search matching student website
  const cleanCategoryQuery = categoryQuery.trim().toLowerCase();

  const { filteredCategories, directMatchingSubcategories } = useMemo(() => {
    if (!cleanCategoryQuery) {
      return {
        filteredCategories: categories,
        directMatchingSubcategories: [] as {
          category: CategoryFeedItem;
          subcategory: { id: string; key: string; name: string };
        }[],
      };
    }

    const matchedSubs: {
      category: CategoryFeedItem;
      subcategory: { id: string; key: string; name: string };
    }[] = [];

    const matchedCats = categories.filter((cat) => {
      const catNameMatches = cat.name.toLowerCase().includes(cleanCategoryQuery);
      const catKeyMatches = (cat.key || '').toLowerCase().includes(cleanCategoryQuery);

      const matchingSubs = (cat.subcategories || []).filter((sub) => {
        const subNameMatches = sub.name.toLowerCase().includes(cleanCategoryQuery);
        const subKeyMatches = (sub.key || '').toLowerCase().includes(cleanCategoryQuery);
        if (subNameMatches || subKeyMatches) {
          matchedSubs.push({ category: cat, subcategory: sub });
          return true;
        }
        return false;
      });

      return catNameMatches || catKeyMatches || matchingSubs.length > 0;
    });

    return {
      filteredCategories: matchedCats,
      directMatchingSubcategories: matchedSubs,
    };
  }, [categories, cleanCategoryQuery]);

  const activeCategory = useMemo(
    () => categories.find((item) => item.id === category),
    [categories, category],
  );

  const visibleSubcategories = useMemo(
    () => activeCategory?.subcategories ?? [],
    [activeCategory],
  );

  const filteredActiveSubcategories = useMemo(() => {
    if (!cleanCategoryQuery) return visibleSubcategories;
    const matching = visibleSubcategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(cleanCategoryQuery) ||
        (sub.key || '').toLowerCase().includes(cleanCategoryQuery),
    );
    if (matching.length > 0) return matching;
    if (
      activeCategory &&
      (activeCategory.name.toLowerCase().includes(cleanCategoryQuery) ||
        (activeCategory.key || '').toLowerCase().includes(cleanCategoryQuery))
    ) {
      return visibleSubcategories;
    }
    return [];
  }, [visibleSubcategories, cleanCategoryQuery, activeCategory]);

  const filteredEvents = useMemo(() => {
    const source = trending ? trendingEvents : events;
    const scoped = source.filter(
      (evt) =>
        (pricing === 'ALL' || trending || evt.pricing_type === pricing) &&
        matchesScheduleFilter(evt, timeline, selectedDate || null),
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
    if (category === id) {
      setCategory('all');
      setSubcategory('');
    } else {
      setCategory(id);
      setSubcategory('');
    }
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

  const handleSelectDateFromModal = (dateStr: string) => {
    setTrending(false);
    setTimeline('all');
    setSelectedDate(dateStr);
  };

  const handleResetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setCategoryQuery('');
    setTrending(false);
    setCategory('all');
    setSubcategory('');
    setTimeline('all');
    setSelectedDate('');
    setPricing('ALL');
  };

  const sectionTitle =
    debouncedQuery.trim().length >= 2
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
      {/* 3-Tier Filter Card — Ultra-Premium VisionOS Glass Formula matching student website */}
      <View
        style={[
          styles.filterPanel,
          {
            backgroundColor: dark ? 'rgba(28, 30, 40, 0.88)' : 'rgba(255, 255, 255, 0.88)',
            borderColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.88)',
          },
        ]}
      >
        {/* Optical Ambient Caustics Mesh */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id={dark ? 'c-tr-dark' : 'c-tr-light'} x1="100%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#ea580c" stopOpacity={dark ? 0.18 : 0.14} />
                <Stop offset="50%" stopColor="#f59e0b" stopOpacity={dark ? 0.08 : 0.06} />
                <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id={dark ? 'c-bl-dark' : 'c-bl-light'} x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#38bdf8" stopOpacity={dark ? 0.12 : 0.09} />
                <Stop offset="50%" stopColor="#6366f1" stopOpacity={dark ? 0.06 : 0.05} />
                <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <SvgRect x="40%" y="-15%" width="75%" height="55%" rx={90} fill={`url(#${dark ? 'c-tr-dark' : 'c-tr-light'})`} />
            <SvgRect x="-25%" y="65%" width="75%" height="55%" rx={90} fill={`url(#${dark ? 'c-bl-dark' : 'c-bl-light'})`} />
          </Svg>
        </View>

        {/* ─── TIER 1: SCHEDULE ─── */}
        <FilterTier
          dark={dark}
          icon="clock"
          title="Schedule"
          showClear={timeline !== 'all' || Boolean(selectedDate)}
          onClear={() => {
            setTimeline('all');
            setSelectedDate('');
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {timelineOptions.map(([id, label]) => {
              const isSelected = !trending && timeline === id && !selectedDate;
              const isTodayPill = id === 'today';

              return (
                <Pressable
                  key={`sched-${id}`}
                  onPress={() => {
                    setTrending(false);
                    setSelectedDate('');
                    setTimeline(id);
                  }}
                  style={[
                    styles.chip,
                    isSelected
                      ? styles.activeOrangeChip
                      : dark
                      ? styles.inactiveDarkChip
                      : styles.inactiveLightChip,
                  ]}
                >
                  {isSelected && (
                    <GradientBackground
                      id={`sched-grad-${id}`}
                      from="#ff802b"
                      to="#ea580c"
                      borderRadius={12}
                    />
                  )}
                  {isTodayPill ? <PulsingLiveDot /> : null}
                  <Text
                    style={[
                      styles.scheduleChipLabel,
                      { color: isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            {/* Date Picker Pill */}
            <Pressable
              onPress={() => setDatePickerVisible(true)}
              style={[
                styles.chip,
                Boolean(selectedDate)
                  ? styles.activeOrangeChip
                  : dark
                  ? styles.inactiveDarkChip
                  : styles.inactiveLightChip,
              ]}
            >
              {Boolean(selectedDate) && (
                <GradientBackground
                  id="sched-grad-date"
                  from="#ff802b"
                  to="#ea580c"
                  borderRadius={12}
                />
              )}
              <NativeIcon
                name="calendar-days"
                size={14}
                color={selectedDate ? '#ffffff' : dark ? '#94a3b8' : '#64748b'}
              />
              <Text
                style={[
                  styles.scheduleChipLabel,
                  { color: selectedDate ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                ]}
              >
                {formatDisplayDate(selectedDate)}
              </Text>
              {selectedDate ? (
                <Pressable
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedDate('');
                  }}
                  style={styles.pillClearIconWrap}
                >
                  <NativeIcon name="x" size={11} color="#ffffff" />
                </Pressable>
              ) : null}
            </Pressable>
          </ScrollView>
        </FilterTier>

        {/* Luxury Frosted Glass Hairline Divider */}
        <HairlineDivider dark={dark} />

        {/* ─── TIER 2: EVENT TYPE ─── */}
        <FilterTier
          dark={dark}
          icon="ticket"
          title="Event Type"
          showClear={pricing !== 'ALL' || trending}
          onClear={() => {
            setPricing('ALL');
            setTrending(false);
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {[
              { id: 'ALL', label: 'All' },
              { id: 'FREE', label: 'Free' },
              { id: 'PAID', label: 'Paid' },
              { id: 'TRENDING', label: 'Trending', emoji: '🔥' },
            ].map((item) => {
              const isSelected = item.id === 'TRENDING' ? trending : !trending && pricing === item.id;

              return (
                <Pressable
                  key={`type-${item.id}`}
                  onPress={() => {
                    if (item.id === 'TRENDING') {
                      selectTrending();
                    } else {
                      leaveTrending(item.id as PricingFilter);
                    }
                  }}
                  style={[
                    styles.chip,
                    isSelected
                      ? styles.activeOrangeChip
                      : dark
                      ? styles.inactiveDarkChip
                      : styles.inactiveLightChip,
                  ]}
                >
                  {isSelected && (
                    <GradientBackground
                      id={`type-grad-${item.id}`}
                      from="#ff802b"
                      to="#ea580c"
                      borderRadius={12}
                    />
                  )}
                  {item.emoji ? (
                    <Text style={{ fontSize: 13, lineHeight: 15 }}>{item.emoji}</Text>
                  ) : null}
                  <Text
                    style={[
                      styles.eventTypeChipLabel,
                      { color: isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </FilterTier>

        {/* Luxury Frosted Glass Hairline Divider */}
        <HairlineDivider dark={dark} />

        {/* ─── TIER 3: CATEGORIES ─── */}
        <View
          style={styles.tier}
          onLayout={(e) => onCategoriesLayout?.(sectionOffset.current + e.nativeEvent.layout.y)}
        >
          <View style={styles.tierHeader}>
            <View style={styles.tierTitle}>
              <View
                style={[
                  styles.tierIcon,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.70)',
                    borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.90)',
                  },
                ]}
              >
                <NativeIcon name="sparkles" size={14} color={dark ? '#ffffff' : '#1e293b'} />
              </View>
              <Text style={[styles.tierLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
                CATEGORIES
              </Text>
            </View>

            {/* Elevated Glass Search Input matching student website */}
            <View
              style={[
                styles.categorySearchWrap,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.60)',
                  borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.80)',
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
              {categoryQuery ? (
                <Pressable onPress={() => setCategoryQuery('')} style={styles.searchClearBtn}>
                  <NativeIcon name="x" size={12} color={palette.mutedText} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Direct Matching Shelf when searching */}
          {cleanCategoryQuery && directMatchingSubcategories.length > 0 ? (
            <View
              style={[
                styles.directMatchShelf,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(241,245,249,0.70)',
                  borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.80)',
                },
              ]}
            >
              <View style={styles.directMatchHeader}>
                <NativeIcon name="sparkles" size={11} color={dark ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.directMatchTitle, { color: dark ? '#cbd5e1' : '#334155' }]}>
                  MATCHES ({directMatchingSubcategories.length})
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.directMatchScroll}
              >
                {directMatchingSubcategories.map(({ category: cat, subcategory: sub }) => {
                  const isSubSelected = category === cat.id && subcategory === sub.id;
                  const SubIcon = getCategoryIcon(sub.key || sub.name);
                  return (
                    <Pressable
                      key={`match-${cat.id}-${sub.id}`}
                      onPress={() => {
                        setTrending(false);
                        setCategory(cat.id);
                        setSubcategory(sub.id);
                      }}
                      style={[
                        styles.directMatchChip,
                        isSubSelected
                          ? dark
                            ? styles.catChipActiveDark
                            : styles.catChipActiveLight
                          : dark
                          ? styles.catChipInactiveDark
                          : styles.catChipInactiveLight,
                      ]}
                    >
                      <NativeIcon
                        name={SubIcon}
                        size={12}
                        color={isSubSelected ? '#ffffff' : dark ? '#cbd5e1' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.directMatchChipText,
                          { color: isSubSelected ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                        ]}
                      >
                        <Text style={{ opacity: 0.6 }}>{cat.name} › </Text>
                        <Text>{sub.name}</Text>
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Category Chips Row */}
          {filteredCategories.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {!cleanCategoryQuery ? (
                <Pressable
                  onPress={() => {
                    setTrending(false);
                    setCategory('all');
                    setSubcategory('');
                  }}
                  style={[
                    styles.catChip,
                    category === 'all'
                      ? dark
                        ? styles.catChipActiveDark
                        : styles.catChipActiveLight
                      : dark
                      ? styles.catChipInactiveDark
                      : styles.catChipInactiveLight,
                  ]}
                >
                  <NativeIcon
                    name="layout-grid"
                    size={13}
                    color={category === 'all' ? '#ffffff' : dark ? '#94a3b8' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.catChipLabel,
                      { color: category === 'all' ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                    ]}
                  >
                    All
                  </Text>
                </Pressable>
              ) : null}

              {filteredCategories.map((cat) => {
                const isSelected = category === cat.id;
                const CatIcon = getCategoryIcon(cat.key || cat.name);
                const subCount = cat.subcategories?.length || 0;

                return (
                  <Pressable
                    key={`cat-${cat.id}`}
                    onPress={() => selectCategory(cat.id)}
                    style={[
                      styles.catChip,
                      isSelected
                        ? dark
                          ? styles.catChipActiveDark
                          : styles.catChipActiveLight
                        : dark
                        ? styles.catChipInactiveDark
                        : styles.catChipInactiveLight,
                    ]}
                  >
                    <NativeIcon
                      name={CatIcon}
                      size={13}
                      color={isSelected ? '#ffffff' : dark ? '#94a3b8' : '#64748b'}
                    />
                    <Text
                      style={[
                        styles.catChipLabel,
                        { color: isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {subCount > 0 ? (
                      <View
                        style={[
                          styles.countBadge,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.20)'
                              : dark
                              ? 'rgba(255,255,255,0.12)'
                              : 'rgba(0,0,0,0.06)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            { color: isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#475569' },
                          ]}
                        >
                          {subCount}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.emptyCategoriesBox,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.50)',
                  borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.70)',
                },
              ]}
            >
              <Text style={[styles.emptyCategoriesText, { color: palette.mutedText }]}>
                No categories matching &ldquo;{categoryQuery}&rdquo;
              </Text>
            </View>
          )}

          {/* Subcategories expansion drawer when category selected */}
          {category !== 'all' && activeCategory && visibleSubcategories.length > 0 ? (
            <View
              style={[
                styles.subcategoriesDrawer,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.60)',
                  borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.80)',
                },
              ]}
            >
              <View style={styles.subDrawerHeader}>
                <View style={styles.subDrawerTitleWrap}>
                  <Text style={[styles.subDrawerCatName, { color: dark ? '#ffffff' : '#0f172a' }]}>
                    {activeCategory.name}
                  </Text>
                  <Text style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: 11 }}> › </Text>
                  <Text
                    style={[styles.subDrawerSubtitle, { color: dark ? '#94a3b8' : '#64748b' }]}
                  >
                    subcategories
                  </Text>
                </View>
                {subcategory ? (
                  <Pressable onPress={() => setSubcategory('')} style={styles.clearBtnInline}>
                    <Text
                      style={[styles.clearBtnInlineText, { color: dark ? '#94a3b8' : '#64748b' }]}
                    >
                      Clear
                    </Text>
                    <NativeIcon name="x" size={10} color={dark ? '#94a3b8' : '#64748b'} />
                  </Pressable>
                ) : null}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subChipsRow}
              >
                <Pressable
                  onPress={() => setSubcategory('')}
                  style={[
                    styles.subChip,
                    !subcategory
                      ? dark
                        ? styles.catChipActiveDark
                        : styles.catChipActiveLight
                      : dark
                      ? styles.catChipInactiveDark
                      : styles.catChipInactiveLight,
                  ]}
                >
                  <NativeIcon
                    name="layout-grid"
                    size={11}
                    color={!subcategory ? '#ffffff' : dark ? '#94a3b8' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.subChipText,
                      { color: !subcategory ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                    ]}
                  >
                    All
                  </Text>
                </Pressable>

                {filteredActiveSubcategories.map((sub) => {
                  const isSelected = subcategory === sub.id || subcategory === sub.name;
                  const SubIcon = getCategoryIcon(sub.key || sub.name);
                  return (
                    <Pressable
                      key={`sub-${sub.id}`}
                      onPress={() => setSubcategory(isSelected ? '' : sub.id)}
                      style={[
                        styles.subChip,
                        isSelected
                          ? dark
                            ? styles.catChipActiveDark
                            : styles.catChipActiveLight
                          : dark
                          ? styles.catChipInactiveDark
                          : styles.catChipInactiveLight,
                      ]}
                    >
                      <NativeIcon
                        name={SubIcon}
                        size={12}
                        color={isSelected ? '#ffffff' : dark ? '#94a3b8' : '#64748b'}
                      />
                      <Text
                        style={[
                          styles.subChipText,
                          { color: isSelected ? '#ffffff' : dark ? '#cbd5e1' : '#334155' },
                        ]}
                      >
                        {sub.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>

      {/* Date Picker Modal */}
      <NativeDatePickerModal
        visible={datePickerVisible}
        dark={dark}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDateFromModal}
        onClose={() => setDatePickerVisible(false)}
      />

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
EventHubComponent.displayName = 'EventHubComponent';

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
EventHub.displayName = 'EventHub';

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
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
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
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  tierClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  tierClearText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  hairlineDividerWrap: {
    width: '100%',
    height: 1,
  },
  categorySearchWrap: {
    flex: 1,
    maxWidth: 185,
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
    fontSize: 12,
    fontWeight: '600',
  },
  searchClearBtn: {
    padding: 2,
    borderRadius: radii.pill,
  },
  directMatchShelf: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  directMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  directMatchTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  directMatchScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  directMatchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  directMatchChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  activeOrangeChip: {
    backgroundColor: '#ea580c',
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  inactiveLightChip: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(226,232,240,0.95)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inactiveDarkChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  scheduleChipLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  eventTypeChipLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pillClearIconWrap: {
    marginLeft: 2,
    padding: 2,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotWrap: {
    width: 8,
    height: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
  },
  catChip: {
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  catChipLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  catChipActiveLight: {
    backgroundColor: '#020617',
    borderColor: '#020617',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  catChipActiveDark: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  catChipInactiveLight: {
    backgroundColor: 'rgba(241,245,249,0.90)',
    borderColor: 'rgba(226,232,240,0.80)',
  },
  catChipInactiveDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.09)',
  },
  countBadge: {
    minWidth: 17,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    lineHeight: 11,
  },
  emptyCategoriesBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyCategoriesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subcategoriesDrawer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  subDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  subDrawerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subDrawerCatName: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subDrawerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  clearBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  clearBtnInlineText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  subChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  subChip: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: radii.pill,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickOptionBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickOptionBtnActive: {
    borderColor: '#ea580c',
    backgroundColor: 'rgba(234,88,12,0.08)',
  },
  quickOptionText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  monthNavBtn: {
    padding: 6,
    borderRadius: radii.pill,
  },
  monthNavTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  weekHeaderText: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 6,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#ea580c',
  },
  dayCellText: {
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalClearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClearBtnText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '800',
  },
  modalDoneBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
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
