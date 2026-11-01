import React, { memo, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { LinearGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import type { EventFeedItem } from '../api/types';
import { colors, glass, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import { formatEventTime as formatTime } from '../features/eventHub';
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
          borderWidth: 1.5,
        },
      ]}
    >
      <SpecularTopRim dark={dark} height={1.5} />
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
      <View
        style={[
          styles.bottomDeck,
          {
            backgroundColor: dark ? glass.dark.cardDeckBg : glass.light.cardDeckBg,
            borderTopColor: dark ? glass.dark.borderSubtle : glass.light.borderSubtle,
          },
        ]}
      >
        {/* Single-line bold event title */}
        <Text
          numberOfLines={1}
          style={[styles.eventName, { color: dark ? '#ffffff' : '#0f172a' }]}
        >
          {event.name}
        </Text>

        {/* Badges Row (Time + Location) & View Action */}
        <View style={styles.deckMetaRow}>
          <View style={styles.metaPillsGroup}>
            {/* Time Pill */}
            <View
              style={[
                styles.metaPill,
                {
                  backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
                  borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
                  borderWidth: 1.5,
                },
              ]}
            >
              <NativeIcon name="clock" size={12} color={dark ? '#fb923c' : '#ea580c'} />
              <Text
                numberOfLines={1}
                style={[styles.metaPillText, { color: dark ? '#f1f5f9' : '#0f172a' }]}
              >
                {time}
              </Text>
            </View>

            {/* Venue Pill */}
            {event.venue_name ? (
              <View
                style={[
                  styles.metaPill,
                  styles.venuePill,
                  {
                    backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
                    borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <NativeIcon name="map-pin" size={12} color={dark ? '#f59e0b' : '#d97706'} />
                <Text
                  numberOfLines={1}
                  style={[styles.metaPillText, { color: dark ? '#e2e8f0' : '#334155' }]}
                >
                  {event.venue_name}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Tactile Liquid Glass View Action */}
          <View
            style={[
              styles.viewPill,
              {
                backgroundColor: dark ? 'rgba(249,115,22,0.22)' : 'rgba(249,115,22,0.14)',
                borderColor: dark ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.30)',
              },
            ]}
          >
            <Text style={styles.viewPillText}>View</Text>
            <NativeIcon name="arrow-right" size={11} color="#ea580c" />
          </View>
        </View>
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
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(380, Math.round(windowWidth * 0.85));
  const listRef = useRef<FlatList<EventFeedItem>>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        {/* View All Action Pill with Count Badge */}
        <Pressable
          onPress={handleOpenViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${events.length} events happening today`}
          style={[
            styles.viewAllButton,
            {
              backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
              borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
              borderWidth: 1.5,
            },
          ]}
        >
          <SpecularTopRim dark={dark} height={1} />
          <Text style={styles.viewAllText}>View All</Text>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(249,115,22,0.15)' },
            ]}
          >
            <Text style={[styles.countBadgeText, { color: dark ? '#ffffff' : '#c2410c' }]}>
              {events.length}
            </Text>
          </View>
          <NativeIcon name="arrow-right" size={11} color="#ea580c" />
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
                  borderWidth: 1.5,
                },
              ]}
            >
              <SpecularTopRim dark={dark} height={1.5} />
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
                <View style={styles.viewPill}>
                  <Text style={styles.viewPillText}>View All</Text>
                  <NativeIcon name="arrow-right" size={11} color="#ea580c" />
                </View>
              </View>
            </Pressable>
          ) : null
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
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsModalOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close happening today modal"
          />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: 'transparent',
                borderColor: dark ? glass.dark.border : glass.light.border,
                borderWidth: 1.5,
              },
            ]}
          >
            {/* Native Hardware Blur Backdrop */}
            <BlurView
              pointerEvents="none"
              intensity={dark ? 70 : 85}
              tint={dark ? 'dark' : 'light'}
              blurMethod="none"
              style={StyleSheet.absoluteFill}
            />

            {/* Translucent Frosted Tint Overlay */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: dark ? glass.dark.modalBg : glass.light.modalBg },
              ]}
            />

            <SpecularTopRim dark={dark} height={1.5} />

            {/* Ambient Caustic Mesh for optical crystal refraction matching website */}
            <View pointerEvents="none" style={styles.causticTopRight} />
            <View pointerEvents="none" style={styles.causticBottomLeft} />

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
                      { color: dark ? '#cbd5e1' : '#64748b' },
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
                    backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                    borderColor: dark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.90)',
                  },
                ]}
              >
                <NativeIcon name="x" size={14} strokeWidth={2.4} color={dark ? '#f1f5f9' : '#334155'} />
              </Pressable>
            </View>

            {/* Modal Event Schedule List matching Student Website */}
            <View style={styles.modalListWrapper}>
              <ScrollView
                style={styles.modalList}
                contentContainerStyle={styles.modalListContent}
                showsVerticalScrollIndicator={false}
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
                        { color: dark ? '#94a3b8' : '#64748b' },
                      ]}
                    >
                      Stay tuned for upcoming workshops, guest lectures, and campus activities scheduled later this week.
                    </Text>
                  </View>
                ) : (
                  events.map((evt, idx) => {
                    const isLast = idx === events.length - 1;
                    const timeString = formatEventTime(evt.start_at);

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
                                color={dark ? '#94a3b8' : '#94a3b8'}
                              />
                            </View>
                          </View>

                          {/* Row 2: Premium Schedule Strip (Time on Left, Venue on Right) */}
                          <View style={styles.modalRow2}>
                            {/* Left: Time */}
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
                                style={[
                                  styles.modalScheduleTimeText,
                                  { color: dark ? '#ffffff' : '#0f172a' },
                                ]}
                              >
                                {timeString}
                              </Text>
                            </View>

                            {/* Right: Venue */}
                            <View style={styles.modalScheduleRight}>
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
                                numberOfLines={1}
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

              {/* Bottom Subtle Optical Fade Overlay matching Student Website */}
              <View pointerEvents="none" style={styles.modalBottomFade}>
                <Svg width="100%" height={24}>
                  <LinearGradient id="modalBottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={dark ? '#1c1c1e' : '#ffffff'} stopOpacity={0} />
                    <Stop offset="100%" stopColor={dark ? '#1c1c1e' : '#ffffff'} stopOpacity={0.85} />
                  </LinearGradient>
                  <SvgRect width="100%" height={24} fill="url(#modalBottomFade)" />
                </Svg>
              </View>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    ...shadows.glass,
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
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.glass,
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
    height: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderTopWidth: 1,
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
    gap: 8,
  },
  metaPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    overflow: 'hidden',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  venuePill: {
    flex: 1,
    maxWidth: 160,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  viewPillText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '900',
  },
  trailingCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.glass,
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
    height: 88,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  modalSheet: {
    height: '62%',
    maxHeight: '78%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.glass,
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
    fontSize: 11.5,
    fontWeight: '600',
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
    flex: 1,
    position: 'relative',
  },
  modalList: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  modalArrowBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  modalRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 2,
  },
  modalScheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  modalScheduleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
  },
  modalScheduleIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalScheduleTimeText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    letterSpacing: -0.2,
  },
  modalScheduleVenueText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.headingFamily,
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
