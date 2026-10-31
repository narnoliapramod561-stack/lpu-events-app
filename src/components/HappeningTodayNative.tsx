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
import Svg, { LinearGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import type { EventFeedItem } from '../api/types';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource } from '../features/homepageModels';
import { NativeIcon } from './NativeIcon';

interface HappeningTodayNativeProps {
  events: EventFeedItem[];
  dark: boolean;
  onSelectEvent: (id: string) => void;
  onViewAll?: () => void;
}

const formatEventTime = (dateStr?: string) => {
  if (!dateStr) return 'Time TBA';
  const start = new Date(dateStr);
  return Number.isNaN(start.getTime())
    ? 'Time TBA'
    : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatTodayDate = () => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  } catch {
    return 'Today';
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
          backgroundColor: dark ? 'rgba(26,26,32,0.92)' : 'rgba(255,255,255,0.92)',
          borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
        },
      ]}
    >
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
            backgroundColor: dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)',
            borderTopColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.50)',
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
                  backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.80)',
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
                    backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)',
                    borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.80)',
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
              backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
              borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)',
            },
          ]}
        >
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
          events.length > 1 ? (
            <Pressable
              onPress={handleOpenViewAll}
              style={[
                styles.trailingCard,
                {
                  width: cardWidth,
                  backgroundColor: dark ? 'rgba(26,26,32,0.92)' : 'rgba(255,255,255,0.92)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                },
              ]}
            >
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
                    backgroundColor: dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)',
                    borderTopColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.50)',
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
          <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)} />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: dark ? 'rgba(20,22,28,0.97)' : 'rgba(255,255,255,0.97)',
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)',
              },
            ]}
          >
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
                <View style={styles.modalCalendarIcon}>
                  <NativeIcon name="calendar-days" size={20} color="#ffffff" strokeWidth={2.2} />
                </View>
                <View style={styles.modalHeaderTitles}>
                  <View style={styles.modalTitleRow}>
                    <Text
                      style={[styles.modalTitleText, { color: dark ? '#ffffff' : '#0f172a' }]}
                    >
                      Happening Today
                    </Text>
                  </View>
                  <View style={styles.modalSubtitleRow}>
                    <Text
                      style={[
                        styles.modalSubtitleDate,
                        { color: dark ? '#94a3b8' : '#64748b' },
                      ]}
                    >
                      {formatTodayDate()}
                    </Text>
                    <View style={styles.modalDotSeparator} />
                    <View
                      style={[
                        styles.modalLiveBadge,
                        {
                          backgroundColor: dark
                            ? 'rgba(249,115,22,0.20)'
                            : 'rgba(249,115,22,0.12)',
                          borderColor: 'rgba(249,115,22,0.30)',
                        },
                      ]}
                    >
                      <View style={styles.livePulseDotInner} />
                      <Text style={styles.modalLiveBadgeText}>
                        {events.length} {events.length === 1 ? 'Event' : 'Events'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Close Button */}
              <Pressable
                onPress={() => setIsModalOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor: dark ? '#ffffff' : '#0f172a',
                  },
                ]}
              >
                <NativeIcon name="x" size={14} strokeWidth={2.5} color={dark ? '#0f172a' : '#ffffff'} />
              </Pressable>
            </View>

            {/* Modal Event List */}
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            >
              {events.map((evt) => {
                const eventImg = eventImageSource(evt);
                const timeString = formatEventTime(evt.start_at);

                return (
                  <Pressable
                    key={evt.id}
                    onPress={() => {
                      setIsModalOpen(false);
                      onSelectEvent(evt.id);
                    }}
                    style={[
                      styles.modalItemRow,
                      {
                        backgroundColor: dark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(255,255,255,0.70)',
                        borderColor: dark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    {/* Thumbnail with LIVE red pill */}
                    <View style={styles.modalItemThumb}>
                      {eventImg ? (
                        <Image source={eventImg} resizeMode="cover" style={styles.modalThumbImage} />
                      ) : (
                        <View style={styles.imageFallback} />
                      )}
                      <View style={styles.liveRedPill}>
                        <View style={styles.liveRedDot} />
                        <Text style={styles.liveRedText}>LIVE</Text>
                      </View>
                    </View>

                    {/* Details: Title, Time, Location */}
                    <View style={styles.modalItemDetails}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.modalItemTitle,
                          { color: dark ? '#ffffff' : '#0f172a' },
                        ]}
                      >
                        {evt.name}
                      </Text>
                      <View style={styles.modalMetaLine}>
                        <NativeIcon name="clock" size={12} color="#ea580c" strokeWidth={2.4} />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.modalMetaLineText,
                            { color: dark ? '#f1f5f9' : '#1e293b' },
                          ]}
                        >
                          {timeString}
                        </Text>
                      </View>
                      {evt.venue_name ? (
                        <View style={styles.modalMetaLine}>
                          <NativeIcon name="map-pin" size={12} color="#d97706" strokeWidth={2.4} />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.modalMetaLineText,
                              { color: dark ? '#94a3b8' : '#64748b' },
                            ]}
                          >
                            {evt.venue_name}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Chevron Affordance */}
                    <View
                      style={[
                        styles.modalChevronCircle,
                        {
                          backgroundColor: dark
                            ? 'rgba(255,255,255,0.10)'
                            : 'rgba(255,255,255,0.80)',
                          borderColor: dark
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(255,255,255,0.90)',
                        },
                      ]}
                    >
                      <NativeIcon
                        name="chevron-right"
                        size={14}
                        strokeWidth={2.5}
                        color={dark ? '#f1f5f9' : '#334155'}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <Pressable
                onPress={() => setIsModalOpen(false)}
                style={[
                  styles.modalCloseFooterBtn,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
                  },
                ]}
              >
                <Text style={[styles.modalCloseFooterText, { color: palette.text }]}>Close</Text>
              </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  modalSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.glass,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalCalendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalHeaderTitles: {
    flex: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontFamily: typography.headingFamily,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  modalSubtitleDate: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  modalDotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94a3b8',
  },
  modalLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
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
    color: '#ea580c',
    fontSize: 10,
    fontWeight: '900',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    flexGrow: 0,
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  modalItemThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  modalThumbImage: {
    width: '100%',
    height: '100%',
  },
  liveRedPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(220,38,38,0.92)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveRedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  liveRedText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: '900',
  },
  modalItemDetails: {
    flex: 1,
    gap: 2,
  },
  modalItemTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  modalMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalMetaLineText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalChevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  modalCloseFooterBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseFooterText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
