import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import type { EventFeedItem } from '../api/types';
import { colors, glass, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import { formatEventTime as formatTime, formatEventTimeRange } from '../features/eventHub';
import { NativeIcon } from './NativeIcon';
import { GlassSheen, SpecularTopRim } from './ui/NativeGlass';

interface HappeningTodayNativeProps {
  events: EventFeedItem[];
  dark: boolean;
  onSelectEvent: (id: string) => void;
  onViewAll?: () => void;
}

const formatEventTime = (dateStr?: string) => {
  if (!dateStr) return 'Time TBA';
  return formatTime(dateStr) || 'Time TBA';
};

const resolveEventSchedule = (startAt?: string, endAt?: string) => {
  if (!startAt) return 'Today • Time TBA';
  const range = formatEventTimeRange(startAt, endAt);
  if (range) return `Today • ${range}`;
  const single = formatTime(startAt);
  return single ? `Today • ${single}` : 'Today • Time TBA';
};

const formatTodayDate = () => {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
    return `${formatted} • Live campus schedule`;
  } catch {
    return 'Today • Live campus schedule';
  }
};

const EventCard = memo(function EventCard({
  event,
  dark,
  cardWidth,
  onPress,
}: {
  event: EventFeedItem;
  dark: boolean;
  cardWidth: number;
  onPress: () => void;
}) {
  const image = eventImageSource(event);
  const time = formatEventTime(event.start_at);
  const categoryName = (event.categories?.name || 'CAMPUS EVENT').toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${event.name}`}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: dark ? glass.dark.cardBg : glass.light.cardBg,
          borderColor: dark ? glass.dark.border : glass.light.border,
          borderWidth: 1,
        },
      ]}
    >
      <BlurView
        pointerEvents="none"
        intensity={dark ? 45 : 65}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <SpecularTopRim dark={dark} height={1} />
      <GlassSheen dark={dark} />
      {/* 16:9 Banner Stage with Ambient Glow Backdrop matching Student Website */}
      <View style={styles.imageBox}>
        {image && (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            blurRadius={20}
          />
        )}
        {/* Soft dark tint */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? 'rgba(0,0,0,0.45)' : 'rgba(15,23,42,0.25)' },
          ]}
        />

        {/* Foreground crisp centered poster */}
        {image ? (
          <Image source={image} resizeMode="contain" style={styles.image} />
        ) : (
          <View style={styles.imageFallback} />
        )}

        {/* Bottom soft vignette gradient */}
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
          <LinearGradient id={`card-vig-${event.id}`} x1="0%" y1="60%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.55)" stopOpacity="1" />
          </LinearGradient>
          <SvgRect width="100%" height="100%" fill={`url(#card-vig-${event.id})`} />
        </Svg>

        {/* Top Badges: Category Jewel with Orange Glowing Dot */}
        <View style={styles.topBadgesRow}>
          <View style={styles.categoryJewel}>
            <View style={styles.jewelDot} />
            <Text numberOfLines={1} style={styles.categoryJewelText}>
              {categoryName}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Information Deck matching Student Website */}
      <View style={styles.bottomDeck}>
        {/* Single-line bold event title */}
        <Text
          numberOfLines={1}
          style={[styles.eventName, { color: dark ? '#ffffff' : '#0f172a' }]}
        >
          {event.name}
        </Text>

        {/* Tier 1: Time on Left, View Action on Right */}
        <View style={styles.deckMetaRow}>
          <View style={styles.metaInlineItem}>
            <NativeIcon name="clock" size={12} color={dark ? '#fb923c' : '#ea580c'} strokeWidth={2.4} />
            <Text
              numberOfLines={1}
              style={[styles.metaInlineText, { color: dark ? '#cbd5e1' : '#475569' }]}
            >
              {time}
            </Text>
          </View>

          {/* Minimal Tactile Action Indicator */}
          <View style={styles.inlineActionWrap}>
            <Text style={styles.viewPillText}>View</Text>
            <NativeIcon name="arrow-right" size={12} color="#ea580c" strokeWidth={2.4} />
          </View>
        </View>

        {/* Tier 2: Venue down below date/time, full text wraps naturally below venue only */}
        {event.venue_name ? (
          <View style={styles.deckVenueRow}>
            <View style={styles.deckVenueIcon}>
              <NativeIcon name="map-pin" size={12} color={dark ? '#f59e0b' : '#d97706'} strokeWidth={2.4} />
            </View>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.deckVenueText, { color: dark ? '#cbd5e1' : '#475569' }]}
            >
              {event.venue_name}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

function HappeningTodayNativeComponent({
  events,
  dark,
  onSelectEvent,
  onViewAll,
}: HappeningTodayNativeProps) {
  const palette = dark ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cardWidth = Math.min(380, Math.round(windowWidth * 0.85));
  const listRef = useRef<FlatList<EventFeedItem>>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic Content-Adaptive Sheet Measurement & Scroll Coordination
  const [overlayHeight, setOverlayHeight] = useState<number>(0);
  const [headerHeight, setHeaderHeight] = useState<number>(86);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const previousContentHeightRef = useRef<number>(0);
  const isInitialMeasurementRef = useRef<boolean>(true);

  // Maximum allowed sheet height strictly preserves the existing 65% ceiling of the containing layout
  const referenceParentHeight = overlayHeight > 0 ? overlayHeight : windowHeight;
  const maxSheetHeight = Math.round(referenceParentHeight * 0.65);
  const maxViewportHeight = Math.max(0, maxSheetHeight - headerHeight);
  const isScrollable = contentHeight > maxViewportHeight && maxViewportHeight > 0;

  useEffect(() => {
    if (!isModalOpen) {
      isInitialMeasurementRef.current = true;
    }
  }, [isModalOpen]);

  const handleOverlayLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 0 && Math.abs(h - overlayHeight) > 2) {
      setOverlayHeight(h);
    }
  }, [overlayHeight]);

  const handleHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 0 && Math.abs(h - headerHeight) > 2) {
      setHeaderHeight(h);
    }
  }, [headerHeight]);

  const handleContentSizeChange = useCallback((_: number, height: number) => {
    const rounded = Math.round(height);
    if (rounded <= 0) return;
    if (Math.abs(rounded - previousContentHeightRef.current) < 2) return;

    if (!isInitialMeasurementRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } else {
      isInitialMeasurementRef.current = false;
    }

    previousContentHeightRef.current = rounded;
    setContentHeight(rounded);
  }, []);

  const items = useMemo(() => events.slice(0, 10), [events]);

  const handleOpenViewAll = () => {
    setIsModalOpen(true);
    if (onViewAll) onViewAll();
  };

  if (!events.length) return null;

  return (
    <View style={styles.section}>
      {/* Dynamic Header matching Student Website */}
      <View style={styles.headingRow}>
        <View style={styles.headingGroup}>
          {/* Calendar Icon Jewel with Glowing Pulse Indicator */}
          <View style={styles.calendarJewel}>
            <NativeIcon name="calendar-days" size={18} color="#ffffff" strokeWidth={2.2} />
            <View style={styles.liveIndicatorContainer}>
              <View style={styles.livePulseDot} />
            </View>
          </View>

          <View style={styles.headingTitles}>
            <Text style={styles.heading}>
              <Text style={{ color: palette.text }}>Happening </Text>
              <Text style={styles.headingAccent}>Today</Text>
            </Text>
            <Text style={[styles.subtitle, { color: dark ? '#cbd5e1' : '#475569' }]}>
              Live schedule &amp; campus events
            </Text>
          </View>
        </View>

        {/* View All Action Pill with Count Badge (Matching Student Website .glass-header-island) */}
        <Pressable
          onPress={handleOpenViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${events.length} events happening today`}
          style={[
            styles.viewAllButton,
            {
              backgroundColor: dark ? 'rgba(36, 37, 44, 0.85)' : 'rgba(255, 255, 255, 0.84)',
              borderColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.90)',
              borderWidth: 1.5,
            },
          ]}
        >
          <BlurView
            pointerEvents="none"
            intensity={Platform.OS === 'ios' ? 25 : 15}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <SpecularTopRim dark={dark} height={1} />
          <Text style={[styles.viewAllText, { color: dark ? '#fdba74' : '#ea580c' }]}>View All</Text>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                borderColor: dark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(249, 115, 22, 0.25)',
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.countBadgeText, { color: dark ? '#ffffff' : '#c2410c' }]}>
              {events.length}
            </Text>
          </View>
          <NativeIcon name="arrow-right" size={11} color={dark ? '#fdba74' : '#ea580c'} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* Horizontal Swipeable Track matching Student Website tile size */}
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={cardWidth + 14}
        snapToAlignment="start"
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            dark={dark}
            cardWidth={cardWidth}
            onPress={() => onSelectEvent(item.id)}
          />
        )}
        ListFooterComponent={
          events.length > items.length ? (
            <Pressable
              onPress={handleOpenViewAll}
              accessibilityRole="button"
              accessibilityLabel={`Explore all ${events.length} events happening today`}
              style={[
                styles.trailingCard,
                {
                  width: cardWidth,
                  backgroundColor: dark ? glass.dark.cardBg : glass.light.cardBg,
                  borderColor: dark ? glass.dark.border : glass.light.border,
                  borderWidth: 1,
                },
              ]}
            >
              <BlurView
                pointerEvents="none"
                intensity={dark ? 45 : 65}
                tint={dark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <SpecularTopRim dark={dark} height={1} />
              <GlassSheen dark={dark} />
              <View style={styles.trailingBannerArea}>
                <View style={styles.trailingArrowCircle}>
                  <NativeIcon name="arrow-right" size={20} color="#ffffff" strokeWidth={2.4} />
                </View>
                <Text style={styles.trailingTitle}>Explore All Today</Text>
                <Text style={styles.trailingSubtitle}>{events.length} Live Activities</Text>
              </View>
              <View
                style={[
                  styles.trailingBottomDeck,
                  {
                    backgroundColor: dark ? glass.dark.cardDeckBg : glass.light.cardDeckBg,
                    borderTopColor: dark ? glass.dark.borderSubtle : glass.light.borderSubtle,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.trailingDeckTitle, { color: palette.text }]}>
                    Full Campus Schedule
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.mutedText }}>
                    Tap to view complete list
                  </Text>
                </View>
                <View
                  style={[
                    styles.trailingActionRow,
                    {
                      backgroundColor: dark ? 'rgba(249, 115, 22, 0.20)' : 'rgba(249, 115, 22, 0.15)',
                      borderColor: 'rgba(249, 115, 22, 0.30)',
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 4.5,
                    },
                  ]}
                >
                  <Text style={[styles.trailingActionText, { color: dark ? '#fdba74' : '#c2410c' }]}>View All</Text>
                  <NativeIcon name="arrow-right" size={12} color={dark ? '#fdba74' : '#ea580c'} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ) : undefined
        }
      />

      {/* =========================================================
          DEDICATED "HAPPENING TODAY - ALL EVENTS" MODAL / SHEET
          Displays all verified live events for today matching Student Website
         ========================================================= */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay} onLayout={handleOverlayLayout}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsModalOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close happening today modal"
          >
            {/* Softly diffused backdrop blur (prevents underlying cards and images from interfering with foreground) */}
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 50}
              tint={dark ? 'dark' : 'systemMaterialDark'}
              style={StyleSheet.absoluteFill}
            />
            {/* Translucent overlay between background and glass sheet */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: dark ? 'rgba(0,0,0,0.55)' : 'rgba(15,23,42,0.35)' },
              ]}
            />
          </Pressable>

          <View
            style={[
              styles.modalSheet,
              {
                borderTopColor: dark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.95)',
                borderTopWidth: 1.5,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderBottomWidth: 0,
                maxHeight: maxSheetHeight,
              },
            ]}
          >
            {/* Native Hardware Blur Surface (High-diffusion Frosted Glass) */}
            <BlurView
              pointerEvents="none"
              intensity={Platform.OS === 'ios' ? 95 : 75}
              tint={dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            {/* Subtle Translucent Milky White / Obsidian Surface Wash (Secures perfect text readability while preserving glass transparency) */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: dark ? 'rgba(18, 20, 28, 0.42)' : 'rgba(255, 255, 255, 0.48)',
                },
              ]}
            />

            {/* Apple VisionOS Luxury Glass Linear Gradient Overlay */}
            <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <LinearGradient id="modal-glass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  {dark ? [
                    <Stop key="d0" offset="0%" stopColor="#1e212d" stopOpacity={0.65} />,
                    <Stop key="d1" offset="45%" stopColor="#161822" stopOpacity={0.58} />,
                    <Stop key="d2" offset="100%" stopColor="#12141c" stopOpacity={0.62} />,
                  ] : [
                    <Stop key="l0" offset="0%" stopColor="#ffffff" stopOpacity={0.62} />,
                    <Stop key="l1" offset="45%" stopColor="#f8fafc" stopOpacity={0.52} />,
                    <Stop key="l2" offset="100%" stopColor="#ffffff" stopOpacity={0.58} />,
                  ]}
                </LinearGradient>
                {/* Caustic Glow 1: Top-Right Warm Amber (matching student website lines 507) */}
                <RadialGradient id="caustic-orange" cx="90%" cy="5%" rx="65%" ry="45%">
                  <Stop offset="0%" stopColor="#f97316" stopOpacity={dark ? 0.22 : 0.25} />
                  <Stop offset="50%" stopColor="#f59e0b" stopOpacity={dark ? 0.10 : 0.12} />
                  <Stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </RadialGradient>
                {/* Caustic Glow 2: Bottom-Left Sky Indigo (matching student website lines 508) */}
                <RadialGradient id="caustic-blue" cx="10%" cy="95%" rx="65%" ry="45%">
                  <Stop offset="0%" stopColor="#38bdf8" stopOpacity={dark ? 0.18 : 0.20} />
                  <Stop offset="50%" stopColor="#6366f1" stopOpacity={dark ? 0.08 : 0.10} />
                  <Stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </RadialGradient>
                {/* Caustic Glow 3: Center Mid Amber Refraction (matching student website lines 509) */}
                <RadialGradient id="caustic-mid" cx="40%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#ea580c" stopOpacity={dark ? 0.08 : 0.10} />
                  <Stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <SvgRect width="100%" height="100%" fill="url(#modal-glass-gradient)" />
              <SvgRect width="100%" height="100%" fill="url(#caustic-orange)" />
              <SvgRect width="100%" height="100%" fill="url(#caustic-blue)" />
              <SvgRect width="100%" height="100%" fill="url(#caustic-mid)" />
            </Svg>

            <SpecularTopRim dark={dark} height={1.5} />

            {/* Fixed Header Group: Drag Handle Bar + Modal Header (Permanently outside scrolling content) */}
            <View onLayout={handleHeaderLayout} style={styles.modalHeaderGroup}>
              {/* Drag Handle Bar */}
              <View style={styles.dragBarContainer}>
                <View
                  style={[
                    styles.dragBar,
                    { backgroundColor: dark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.20)' },
                  ]}
                />
              </View>

              {/* Modal Header */}
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' },
                ]}
              >
                <View style={styles.modalHeaderInfo}>
                  {/* Glowing Calendar Jewel */}
                  <View style={styles.modalCalendarIcon}>
                    <NativeIcon name="calendar-days" size={20} color="#ffffff" strokeWidth={2.2} />
                  </View>
                  <View style={styles.modalHeaderTitles}>
                    {/* Title Row with Event Count Pill */}
                    <View style={styles.modalTitleRow}>
                      <Text
                        style={[styles.modalTitleText, { color: dark ? '#ffffff' : '#0f172a' }]}
                      >
                        Happening Today
                      </Text>
                      <View
                        style={[
                          styles.modalLiveBadge,
                          {
                            backgroundColor: dark
                              ? 'rgba(249,115,22,0.22)'
                              : 'rgba(249,115,22,0.14)',
                            borderColor: dark ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.30)',
                          },
                        ]}
                      >
                        <View style={styles.livePulseDotInner} />
                        <Text
                          style={[
                            styles.modalLiveBadgeText,
                            { color: dark ? '#fdba74' : '#c2410c' },
                          ]}
                        >
                          {events.length} {events.length === 1 ? 'Event' : 'Events'}
                        </Text>
                      </View>
                    </View>
                    {/* Subtitle: Date & Schedule */}
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.modalSubtitleDate,
                        { color: dark ? '#cbd5e1' : '#475569' },
                      ]}
                    >
                      {formatTodayDate()}
                    </Text>
                  </View>
                </View>

                {/* Close Button matching Frosted Glass Jewel */}
                <Pressable
                  onPress={() => setIsModalOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  style={[
                    styles.modalCloseButton,
                    {
                      backgroundColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.92)',
                      borderColor: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <NativeIcon name="x" size={14} strokeWidth={2.4} color={dark ? '#f8fafc' : '#1e293b'} />
                </Pressable>
              </View>
            </View>

            {/* Modal Event Schedule List (Dynamically bounded to viewport below fixed header) */}
            <View
              style={[
                styles.modalListWrapper,
                maxViewportHeight > 0 ? { maxHeight: maxViewportHeight } : undefined,
              ]}
            >
              <ScrollView
                style={styles.modalList}
                contentContainerStyle={[
                  styles.modalListContent,
                  { paddingBottom: Math.max(28, insets.bottom + 16) },
                ]}
                showsVerticalScrollIndicator={false}
                scrollEnabled={isScrollable}
                bounces={isScrollable}
                alwaysBounceVertical={false}
                onContentSizeChange={handleContentSizeChange}
              >
                {events.length === 0 ? (
                  <View style={styles.modalEmptyState}>
                    <View
                      style={[
                        styles.emptyStateIconCircle,
                        {
                          backgroundColor: dark
                            ? 'rgba(249,115,22,0.15)'
                            : 'rgba(249,115,22,0.10)',
                          borderColor: dark
                            ? 'rgba(249,115,22,0.30)'
                            : 'rgba(249,115,22,0.20)',
                        },
                      ]}
                    >
                      <NativeIcon
                        name="calendar-days"
                        size={24}
                        color="#ea580c"
                        strokeWidth={2.2}
                      />
                    </View>
                    <Text
                      style={[
                        styles.emptyStateTitle,
                        { color: dark ? '#ffffff' : '#0f172a' },
                      ]}
                    >
                      No Events Scheduled For Today
                    </Text>
                    <Text
                      style={[
                        styles.emptyStateSubtitle,
                        { color: dark ? '#cbd5e1' : '#475569' },
                      ]}
                    >
                      Stay tuned for upcoming workshops, guest lectures, and campus activities scheduled later this week.
                    </Text>
                  </View>
                ) : (
                  events.map((evt, idx) => {
                    const isLast = idx === events.length - 1;
                    const scheduleString = resolveEventSchedule(evt.start_at, evt.end_at);

                    return (
                      <React.Fragment key={evt.id || idx}>
                        <Pressable
                          onPress={() => {
                            setIsModalOpen(false);
                            onSelectEvent(evt.id);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`View details for ${evt.name}`}
                          style={({ pressed }) => [
                            styles.modalItemPressable,
                            {
                              backgroundColor: pressed
                                ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.06)')
                                : 'transparent',
                            },
                          ]}
                        >
                          {/* Row 1: Event Name (Hero Emphasis) + Subtle Arrow */}
                          <View style={styles.modalRow1}>
                            <Text
                              numberOfLines={2}
                              style={[
                                styles.modalItemTitle,
                                { color: dark ? '#ffffff' : '#0f172a' },
                              ]}
                            >
                              {evt.name}
                            </Text>
                            <View style={styles.modalArrowBox}>
                              <NativeIcon
                                name="chevron-right"
                                size={16}
                                strokeWidth={2.4}
                                color={dark ? '#94a3b8' : '#64748b'}
                              />
                            </View>
                          </View>

                          {/* Row 2: Schedule Strip (Date & Time on top, Venue flows down below with full width) */}
                          <View style={styles.modalScheduleStack}>
                            {/* Line 1: Date & Time */}
                            <View style={styles.modalScheduleLeft}>
                              <View
                                style={[
                                  styles.modalScheduleIconBox,
                                  {
                                    backgroundColor: dark
                                      ? 'rgba(234,88,12,0.22)'
                                      : 'rgba(234,88,12,0.14)',
                                    borderColor: 'rgba(234,88,12,0.30)',
                                  },
                                ]}
                              >
                                <NativeIcon name="clock" size={13} color="#ea580c" strokeWidth={2.6} />
                              </View>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[
                                  styles.modalScheduleTimeText,
                                  { color: dark ? '#f8fafc' : '#0f172a' },
                                ]}
                              >
                                {scheduleString}
                              </Text>
                            </View>

                            {/* Line 2: Venue (flows down here with full card width) */}
                            <View style={styles.modalScheduleVenueRow}>
                              <View
                                style={[
                                  styles.modalScheduleIconBox,
                                  {
                                    backgroundColor: dark
                                      ? 'rgba(217,119,6,0.22)'
                                      : 'rgba(217,119,6,0.14)',
                                    borderColor: 'rgba(217,119,6,0.30)',
                                  },
                                ]}
                              >
                                <NativeIcon name="map-pin" size={13} color="#d97706" strokeWidth={2.6} />
                              </View>
                              <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={[
                                  styles.modalScheduleVenueText,
                                  { color: dark ? '#cbd5e1' : '#334155' },
                                ]}
                              >
                                {evt.venue_name || 'LPU Campus'}
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        {/* 3D Optical Etched Glass Separator Line (Groove + Highlight) */}
                        {!isLast && (
                          <View style={styles.etchedDividerWrap}>
                            <View
                              style={[
                                styles.etchedGroove,
                                {
                                  backgroundColor: dark
                                    ? 'rgba(255,255,255,0.12)'
                                    : 'rgba(15,23,42,0.10)',
                                },
                              ]}
                            />
                            <View
                              style={[
                                styles.etchedHighlight,
                                {
                                  backgroundColor: dark
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'rgba(255,255,255,0.85)',
                                },
                              ]}
                            />
                          </View>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </ScrollView>

              {/* Bottom Subtle Optical Fade Overlay matching Student Website (only when additional scrollable content exists) */}
              {isScrollable && (
                <View pointerEvents="none" style={styles.modalBottomFade}>
                  <Svg width="100%" height={24}>
                    <LinearGradient id="modalBottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={dark ? '#161820' : '#ffffff'} stopOpacity={0} />
                      <Stop offset="100%" stopColor={dark ? '#161820' : '#ffffff'} stopOpacity={dark ? 0.35 : 0.25} />
                    </LinearGradient>
                    <SvgRect width="100%" height={24} fill="url(#modalBottomFade)" />
                  </Svg>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const HappeningTodayNative = memo(HappeningTodayNativeComponent);

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.section,
    marginBottom: spacing.sm,
  },
  headingRow: {
    marginHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  calendarJewel: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  liveIndicatorContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ea580c',
  },
  headingTitles: {
    flex: 1,
  },
  heading: {
    fontFamily: typography.headingFamily,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headingAccent: {
    color: '#ff6b00',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radii.pill,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  viewAllText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '900',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    gap: 14,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  card: {
    borderRadius: 24,
    borderTopWidth: 1.6,
    borderLeftWidth: 1.1,
    borderRightWidth: 1.1,
    borderBottomWidth: 1.0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  imageBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0f172a',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  imageFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#182033',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryJewel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  jewelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  categoryJewelText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  bottomDeck: {
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  eventName: {
    fontFamily: typography.headingFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  deckMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  deckVenueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    width: '100%',
  },
  deckVenueIcon: {
    marginTop: 2,
  },
  deckVenueText: {
    fontFamily: typography.headingFamily,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
    flex: 1,
    lineHeight: 15,
  },
  metaInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaInlineText: {
    fontFamily: typography.headingFamily,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  inlineActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewPillText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '800',
  },
  trailingCard: {
    borderRadius: 24,
    borderTopWidth: 1.6,
    borderLeftWidth: 1.1,
    borderRightWidth: 1.1,
    borderBottomWidth: 1.0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  trailingBannerArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(234,88,12,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  trailingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ea580c',
    letterSpacing: 0.4,
  },
  trailingSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  trailingBottomDeck: {
    minHeight: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  trailingDeckTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  trailingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trailingActionText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  modalSheet: {
    maxHeight: '65%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
    flexShrink: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -14 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  modalHeaderGroup: {
    width: '100%',
    flexShrink: 0,
  },
  causticTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  causticBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(56,189,248,0.08)',
  },
  dragBarContainer: {
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'center',
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  modalCalendarIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  modalHeaderTitles: {
    flex: 1,
    minWidth: 0,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  modalTitleText: {
    fontFamily: typography.headingFamily,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSubtitleDate: {
    fontFamily: typography.headingFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginTop: 2,
  },
  modalLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  livePulseDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ea580c',
  },
  modalLiveBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: -0.1,
    fontFamily: typography.headingFamily,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalListWrapper: {
    position: 'relative',
    flexShrink: 1,
  },
  modalList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  modalEmptyState: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  modalItemPressable: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  modalRow1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  modalItemTitle: {
    flex: 1,
    fontFamily: typography.headingFamily,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  modalArrowBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  modalScheduleStack: {
    gap: 7,
    width: '100%',
    paddingTop: 2,
  },
  modalScheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  modalScheduleVenueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  modalScheduleIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  modalScheduleTimeText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    letterSpacing: -0.15,
    flex: 1,
  },
  modalScheduleVenueText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.headingFamily,
    letterSpacing: -0.1,
    flex: 1,
    lineHeight: 18,
    marginTop: 1,
  },
  etchedDividerWrap: {
    marginHorizontal: 8,
    marginVertical: 4,
    height: 2,
  },
  etchedGroove: {
    height: 1,
    width: '100%',
  },
  etchedHighlight: {
    height: 1,
    width: '100%',
  },
  modalBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 20,
  },
});
