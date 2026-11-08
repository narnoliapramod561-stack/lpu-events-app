import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PublicApiClient } from '../../src/api/publicApi';
import type { EventDetails } from '../../src/api/types';
import { eventImageSource } from '../../src/features/homepageModels';
import { formatEventDateRange, formatEventTimeRange } from '../../src/features/eventHub';
import { colors, glass, radii, shadows, spacing, typography } from '../../src/design/tokens';
import { BlurView } from 'expo-blur';
import { NativeIcon, type IconName } from '../../src/components/NativeIcon';
import { useTheme } from '../../src/theme/ThemeContext';
import { isSafeExternalUrl, openExternalUrl } from '../../src/utils/externalLinks';
import { extractEventId } from '../../src/utils/slug';
import { BookingDisclaimerModal } from '../../src/components/BookingDisclaimerModal';
import { ShareModal } from '../../src/components/ShareModal';
import { ZoomableImageViewer } from '../../src/components/ZoomableImageViewer';
import { SpecularTopRim, LiquidGlassCard } from '../../src/components/ui/NativeGlass';
import { CampusBackground } from '../../src/components/CampusBackground';
import { EventSectionRenderer, extractSectionText } from '../../src/components/events/EventSectionRenderer';

const api = new PublicApiClient();
const dateText = (event: EventDetails) => formatEventDateRange(event.start_at, event.end_at) || 'Date to be announced';
const timeText = (event: EventDetails) => formatEventTimeRange(event.start_at, event.end_at) || 'Time to be announced';

function Skeleton({ dark }: { dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.skeleton}>
      <View style={[styles.skeletonPoster, { backgroundColor: palette.surface2 }]} />
      <View style={[styles.skeletonLine, { backgroundColor: palette.surface2, width: '78%' }]} />
      <View style={[styles.skeletonLine, { backgroundColor: palette.surface2, width: '45%' }]} />
      <View style={[styles.skeletonPanel, { backgroundColor: palette.surface2 }]} />
      <View style={[styles.skeletonOrganizer, { backgroundColor: palette.surface2 }]} />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  dark,
  tone,
  last,
}: {
  icon: IconName;
  label: string;
  value: string;
  dark: boolean;
  tone: 'orange' | 'yellow' | 'pink';
  last?: boolean;
}) {
  const palette = dark ? colors.dark : colors.light;
  const toneColors = {
    orange: { icon: '#f97316', background: 'rgba(249,115,22,0.14)', text: '#ea580c' },
    yellow: { icon: '#d97706', background: 'rgba(245,158,11,0.15)', text: '#d97706' },
    pink: { icon: '#e11d48', background: 'rgba(225,29,72,0.14)', text: '#e11d48' },
  }[tone];

  return (
    <View
      style={[
        styles.infoRow,
        { borderBottomColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
        last && styles.infoRowLast,
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: toneColors.background }]}>
        <NativeIcon name={icon} size={18} color={dark ? '#ffffff' : toneColors.icon} strokeWidth={2.3} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: dark ? '#f97316' : toneColors.text }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const rawId = Array.isArray(id) ? id[0] : id ?? '';
  const eventId = useMemo(() => extractEventId(rawId), [rawId]);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  const { dark } = useTheme();
  const palette = dark ? colors.dark : colors.light;

  // Pre-seed with existing event from memory for instant 0ms render
  const initialEvent = useMemo(() => {
    if (!rawId) return null;
    const preloaded = api.getPreloadedEvent(rawId) || api.getPreloadedEvent(eventId);
    return preloaded as EventDetails | null;
  }, [rawId, eventId]);

  const [event, setEvent] = useState<EventDetails | null>(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('about');
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelWidth, setPanelWidth] = useState(() => Dimensions.get('window').width - spacing.gutter * 2);
  const contentPagerRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const tabsScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Synchronize internal state when rawId / initialEvent changes
  useEffect(() => {
    if (initialEvent) {
      setEvent(initialEvent);
    }
  }, [initialEvent]);

  const load = useCallback(
    async (force = false) => {
      if (!rawId) {
        setLoading(false);
        setErrorMessage('A valid event identifier is required.');
        return;
      }
      if (force) setRefreshing(true);
      else if (!initialEvent) setLoading(true);
      setDetailsLoading(true);
      setErrorMessage(null);

      const result = await api.getEventDetails(rawId);
      if (result.data) {
        setEvent(result.data);
        setImageFailed(false);
        // Pure analytics view tracking (debounced at edge)
        void api.incrementEventView(result.data.id);
      } else {
        if (!initialEvent) {
          setErrorMessage(
            result.error.code === 'HTTP_ERROR' && result.error.status === 404
              ? 'This event could not be found.'
              : result.error.message,
          );
        }
      }
      setLoading(false);
      setDetailsLoading(false);
      setRefreshing(false);
    },
    [rawId, initialEvent],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const sections = useMemo(() => {
    const source = (event?.event_content_sections ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const about = source.find(
      (item) => /about|overview/i.test(item.title) || item.section_type.toUpperCase() === 'ABOUT',
    );
    const aboutContent = extractSectionText(about?.content) || event?.description || '';
    return [
      { id: 'about', title: 'About the Event', content: aboutContent },
      ...source
        .filter((item) => item !== about)
        .map((item) => ({ id: item.id, title: item.title, content: item.content })),
    ];
  }, [event]);

  // Synchronize active section with pager
  useEffect(() => {
    if (sections.length > 0) {
      const idx = sections.findIndex((s) => s.id === activeSection);
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
        contentPagerRef.current?.scrollTo({ x: idx * panelWidth, animated: false });
      }
    }
  }, [sections]);

  // Dynamic layout measurements for ultra-smooth centering & fluid gesture tracking
  const tabLayoutsRef = useRef<{ [key: number]: { x: number; width: number } }>({});
  const tabsScrollWidthRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef(false);

  const handleTabLayout = useCallback((index: number, layout: { x: number; width: number }) => {
    tabLayoutsRef.current[index] = layout;
  }, []);

  const scrollToTab = useCallback((index: number) => {
    const layout = tabLayoutsRef.current[index];
    const containerWidth = tabsScrollWidthRef.current || (Dimensions.get('window').width - spacing.gutter * 2);
    if (layout) {
      const targetX = Math.max(0, layout.x - (containerWidth - layout.width) / 2);
      tabsScrollRef.current?.scrollTo({ x: targetX, animated: true });
    } else {
      const tabEstimatedWidth = 120;
      const targetX = Math.max(0, index * tabEstimatedWidth - (containerWidth - tabEstimatedWidth) / 2);
      tabsScrollRef.current?.scrollTo({ x: targetX, animated: true });
    }
  }, []);

  const switchSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= sections.length) return;
      if (index !== activeIndex) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setActiveIndex(index);
        setActiveSection(sections[index].id);
        scrollToTab(index);
      }
    },
    [activeIndex, sections, scrollToTab],
  );

  const handleTabPress = (index: number) => {
    if (index === activeIndex) return;
    isProgrammaticScrollRef.current = true;
    switchSection(index);
    contentPagerRef.current?.scrollTo({
      x: index * panelWidth,
      animated: true,
    });
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 380);
  };

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isProgrammaticScrollRef.current) return;
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / panelWidth);
      if (index >= 0 && index < sections.length && index !== activeIndex) {
        switchSection(index);
      }
    },
    [panelWidth, sections.length, activeIndex, switchSection],
  );

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isProgrammaticScrollRef.current = false;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / panelWidth);
    if (index >= 0 && index < sections.length) {
      switchSection(index);
    }
  };

  const externalUrl = isSafeExternalUrl(event?.external_registration_url) ? event.external_registration_url : null;
  const image = event && !imageFailed ? eventImageSource(event) : undefined;
  const categoryName = (event?.categories?.name || 'CAMPUS EVENT').toUpperCase();

  const isPaid =
    (event?.pricing_type === 'PAID' ||
      (typeof event?.price_amount === 'number' && event.price_amount > 0)) &&
    event?.pricing_type !== 'FREE';
  const priceDisplay =
    isPaid && event?.price_amount !== undefined && event?.price_amount !== null
      ? `₹${event.price_amount}`
      : isPaid
      ? 'Paid'
      : 'Free Entry';

  const handleBookPress = () => {
    if (externalUrl) {
      setBookingModalVisible(true);
    }
  };

  const handleConfirmBooking = async () => {
    setBookingModalVisible(false);
    if (externalUrl) await openExternalUrl(externalUrl, 'registration');
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <CampusBackground dark={dark} blurred />

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          externalUrl ? { paddingBottom: 100 + bottomInset } : { paddingBottom: 36 + bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={palette.primary}
            colors={[palette.primary]}
            progressBackgroundColor={dark ? '#1c1c22' : '#ffffff'}
          />
        }
      >
        {/* Top Bar with Back & Share Actions — Frosted Glass Jewel Buttons */}
        <View style={styles.topbar}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Back to events"
            style={({ pressed }) => [pressed && styles.buttonPressed]}
          >
            <LiquidGlassCard
              dark={dark}
              borderRadius={radii.pill}
              tintColor={dark ? glass.dark.pillBg : glass.light.pillBg}
              borderColor={dark ? glass.dark.pillBorder : glass.light.pillBorder}
              style={styles.backPill}
              contentStyle={styles.backPillContent}
              shadow={false}
            >
              <NativeIcon name="arrow-left" size={17} color={palette.text} strokeWidth={2.4} />
              <Text style={[styles.backText, { color: palette.text }]}>Back to events</Text>
            </LiquidGlassCard>
          </Pressable>

          <Pressable
            onPress={() => setShareModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Share event"
            style={({ pressed }) => [pressed && styles.buttonPressed]}
          >
            <LiquidGlassCard
              dark={dark}
              borderRadius={radii.pill}
              tintColor={dark ? glass.dark.pillBg : glass.light.pillBg}
              borderColor={dark ? glass.dark.pillBorder : glass.light.pillBorder}
              style={styles.sharePill}
              contentStyle={styles.sharePillContent}
              shadow={false}
            >
              <NativeIcon name="share" size={16} color="#ea580c" strokeWidth={2.2} />
              <Text style={[styles.backText, { color: palette.text }]}>Share</Text>
            </LiquidGlassCard>
          </Pressable>
        </View>

        {loading && !event ? <Skeleton dark={dark} /> : null}

        {!loading && !event ? (
          <View style={styles.center}>
            <Text style={[styles.errorTitle, { color: palette.text }]}>Event Not Found</Text>
            <Text style={[styles.errorDescription, { color: palette.mutedText }]}>
              {errorMessage ?? 'This event could not be found.'}
            </Text>
            <Pressable onPress={() => void load(true)} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {event ? (
          <>
            {/* 16:9 Banner Stage with Ambient Blur Backdrop (Clickable to enlarge in center) */}
            <Pressable
              onPress={() => {
                if (image) setImageModalVisible(true);
              }}
              disabled={!image}
              accessibilityRole="button"
              accessibilityLabel="View full size event image"
              style={({ pressed }) => [pressed && Boolean(image) && styles.posterPressed]}
            >
              <LiquidGlassCard
                dark={dark}
                borderRadius={radii.lg}
                tintColor={dark ? glass.dark.cardBg : glass.light.cardBg}
                borderColor={dark ? glass.dark.border : glass.light.border}
                style={styles.posterCardWrapper}
                contentStyle={styles.posterCardContent}
              >
                {image ? (
                  <>
                    <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={24} />
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: dark ? 'rgba(0,0,0,0.50)' : 'rgba(15,23,42,0.30)' },
                      ]}
                    />
                    <Image
                      source={image}
                      resizeMode="contain"
                      style={styles.poster}
                      onError={() => setImageFailed(true)}
                    />

                    {/* Subtle Enlarge Hint Badge */}
                    <View style={styles.enlargeBadge}>
                      <NativeIcon name="arrow-up-right" size={11} color="#ffffff" strokeWidth={2.4} />
                      <Text style={styles.enlargeBadgeText}>View</Text>
                    </View>
                  </>
                ) : (
                  <View style={[styles.posterFallback, { backgroundColor: dark ? '#222228' : '#e2e8f0' }]} />
                )}

                {/* Category Jewel Badge */}
                <View style={styles.categoryJewel}>
                  <View style={styles.jewelDot} />
                  <Text numberOfLines={1} style={styles.categoryJewelText}>
                    {categoryName}
                  </Text>
                </View>

                {/* Paid Event Badge (Only shown if isPaid, matching student website) */}
                {isPaid ? (
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>PAID EVENT</Text>
                  </View>
                ) : null}
              </LiquidGlassCard>
            </Pressable>

            {/* Event Title with Dynamic Typography System */}
            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[
                styles.title,
                {
                  color: palette.text,
                  textShadowColor: dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                  textShadowOffset: { width: 0, height: dark ? 3 : 1 },
                  textShadowRadius: dark ? 12 : 2,
                },
              ]}
            >
              {event.name}
            </Text>

            {/* Cancelled Banner if applicable */}
            {event.status === 'CANCELLED' ? (
              <View style={styles.cancelled}>
                <Text style={styles.cancelledTitle}>Event Cancelled</Text>
                <Text style={styles.cancelledText}>This event was cancelled by the organizers.</Text>
              </View>
            ) : null}

            {/* Unified Schedule & Venue Glass Panel */}
            <LiquidGlassCard
              dark={dark}
              borderRadius={radii.xl}
              tintColor={dark ? glass.dark.panelBg : glass.light.panelBg}
              borderColor={dark ? glass.dark.border : glass.light.border}
              style={styles.infoPanelWrapper}
              contentStyle={styles.infoPanelContent}
            >
              <InfoRow icon="calendar" label="DATE" value={dateText(event)} dark={dark} tone="orange" />
              <InfoRow icon="clock" label="TIME" value={timeText(event)} dark={dark} tone="yellow" />
              <InfoRow icon="map-pin" label="VENUE" value={event.venue_name || 'LPU Campus'} dark={dark} tone="pink" last />
            </LiquidGlassCard>

            {/* Separate Verified Organizer Glass Panel (Placed below venue & date with a subtle gap) */}
            <LiquidGlassCard
              dark={dark}
              borderRadius={radii.xl}
              tintColor={dark ? glass.dark.panelBg : glass.light.panelBg}
              borderColor={dark ? glass.dark.border : glass.light.border}
              style={styles.organizerPanelWrapper}
              contentStyle={styles.organizerPanelContent}
            >
              <View style={styles.organizerRow}>
                <View style={styles.organizerIconBox}>
                  <NativeIcon name="users" size={19} color="#ea580c" strokeWidth={2.4} />
                </View>
                <View style={styles.organizerInfo}>
                  <View style={styles.organizerEyebrowRow}>
                    <Text style={styles.organizerEyebrow}>ORGANIZED BY</Text>
                    <NativeIcon name="check-circle" size={13} color="#10b981" strokeWidth={2.6} />
                  </View>
                  <Text numberOfLines={1} style={[styles.organizerName, { color: palette.text }]}>
                    {event.organizations?.name || 'Lovely Professional University'}
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            {/* Horizontal Scrollable Section Tabs Track (Frosted Glass Dock Capsule) */}
            <LiquidGlassCard
              dark={dark}
              borderRadius={radii.pill}
              tintColor={dark ? 'rgba(34, 34, 38, 0.92)' : 'rgba(255, 255, 255, 0.92)'}
              borderColor={dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.92)'}
              style={styles.tabsDockWrapper}
              contentStyle={styles.tabsDockContent}
              shadow={false}
            >
              <ScrollView
                ref={tabsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.tabsScrollContent}
                onLayout={(e) => {
                  tabsScrollWidthRef.current = e.nativeEvent.layout.width;
                }}
              >
                {sections.map((section, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <Pressable
                      key={section.id}
                      onPress={() => handleTabPress(idx)}
                      onLayout={(e) => {
                        const { x, width } = e.nativeEvent.layout;
                        handleTabLayout(idx, { x, width });
                      }}
                      style={({ pressed }) => [
                        styles.tab,
                        isActive
                          ? styles.activeTab
                          : [
                              styles.inactiveTab,
                              {
                                backgroundColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
                                borderColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                              },
                            ],
                        pressed && styles.tabPressed,
                      ]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                    >
                      {isActive && <SpecularTopRim dark={dark} height={1} intensity={0.9} />}
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color: isActive ? '#ffffff' : (dark ? '#cbd5e1' : '#475569'),
                            fontWeight: isActive ? '900' : '700',
                          },
                        ]}
                      >
                        {section.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </LiquidGlassCard>

            {/* Slidable Animated Content Carousel Pager (Hardware accelerated 120Hz native paging) */}
            <View
              style={styles.pagerWrapper}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0 && Math.abs(w - panelWidth) > 1) {
                  setPanelWidth(w);
                }
              }}
            >
              <ScrollView
                ref={contentPagerRef}
                horizontal
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                decelerationRate="fast"
                bounces={true}
                overScrollMode="never"
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                style={[styles.pagerScrollView, { width: panelWidth }]}
                contentContainerStyle={styles.pagerContentContainer}
              >
                {sections.map((section, idx) => (
                  <View key={section.id} style={{ width: panelWidth, paddingHorizontal: 2 }}>
                    <LiquidGlassCard
                      dark={dark}
                      borderRadius={radii.xl}
                      tintColor={dark ? 'rgba(30, 30, 34, 0.96)' : 'rgba(255, 255, 255, 0.94)'}
                      borderColor={dark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.95)'}
                      style={styles.contentCardWrapper}
                      contentStyle={styles.contentCardContent}
                    >
                      {/* Section Card Header Badge & Swipe Hint */}
                      <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeaderBadge}>
                          <Text style={styles.sectionHeaderBadgeText}>
                            {`SECTION ${String(idx + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`}
                          </Text>
                        </View>
                        <View style={styles.sectionSwipeCue}>
                          <Text style={[styles.sectionSwipeCueText, { color: dark ? '#a1a1aa' : '#64748b' }]}>
                            {idx < sections.length - 1 ? 'Swipe for more' : 'Final section'}
                          </Text>
                          <NativeIcon
                            name={idx < sections.length - 1 ? 'arrow-right' : 'check'}
                            size={12}
                            color={dark ? '#f97316' : '#ea580c'}
                            strokeWidth={2.4}
                          />
                        </View>
                      </View>

                      <View
                        style={[
                          styles.sectionDivider,
                          { backgroundColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
                        ]}
                      />

                      {/* Main Section Content */}
                      <EventSectionRenderer content={section.content} dark={dark} loading={detailsLoading} />

                      {/* Next Section Action Pill or Completion Hint */}
                      {idx < sections.length - 1 ? (
                        <Pressable
                          onPress={() => handleTabPress(idx + 1)}
                          style={({ pressed }) => [
                            styles.nextSectionButton,
                            {
                              backgroundColor: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 88, 12, 0.08)',
                              borderColor: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(234, 88, 12, 0.20)',
                            },
                            pressed && styles.buttonPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Next section: ${sections[idx + 1].title}`}
                        >
                          <View style={styles.nextSectionCopy}>
                            <Text style={[styles.nextSectionEyebrow, { color: dark ? '#a1a1aa' : '#64748b' }]}>
                              NEXT SECTION
                            </Text>
                            <Text numberOfLines={1} style={[styles.nextSectionTitle, { color: palette.text }]}>
                              {sections[idx + 1].title}
                            </Text>
                          </View>
                          <View style={styles.nextSectionArrowBox}>
                            <NativeIcon name="arrow-right" size={15} color="#ffffff" strokeWidth={2.6} />
                          </View>
                        </Pressable>
                      ) : (
                        <View style={styles.sectionEndNotice}>
                          <NativeIcon name="check-circle" size={14} color="#10b981" strokeWidth={2.4} />
                          <Text style={[styles.sectionEndNoticeText, { color: dark ? '#a1a1aa' : '#64748b' }]}>
                            End of event details
                          </Text>
                        </View>
                      )}
                    </LiquidGlassCard>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Pagination Dots Indicator Bar */}
            {sections.length > 1 && (
              <View style={styles.dotsDock}>
                {sections.map((_, i) => {
                  const isDotActive = activeIndex === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleTabPress(i)}
                      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                      style={({ pressed }) => [
                        styles.dotTouchTarget,
                        pressed && { opacity: 0.7 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Go to section ${i + 1}`}
                    >
                      <View
                        style={[
                          styles.dot,
                          isDotActive
                            ? styles.activeDot
                            : [
                                styles.inactiveDot,
                                {
                                  backgroundColor: dark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)',
                                },
                              ],
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Floating Sticky Bottom Action Dock with Hardware Blur & Admission Status */}
      {externalUrl && event ? (
        <View
          style={[
            styles.stickyBottomBar,
            {
              paddingBottom: bottomInset + 6,
              borderTopColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        >
          <BlurView
            pointerEvents="none"
            intensity={Platform.OS === 'android' ? 70 : 90}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: dark ? 'rgba(22, 22, 26, 0.94)' : 'rgba(255, 255, 255, 0.94)' },
            ]}
          />
          <SpecularTopRim dark={dark} height={1.2} intensity={0.9} />

          {/* Left Side: Ticket Price & Admission Status (Matching Website) */}
          <View style={styles.dockPriceRow}>
            <View style={styles.dockPriceIcon}>
              <NativeIcon name="ticket" size={19} color="#ea580c" strokeWidth={2.4} />
            </View>
            <View style={styles.dockPriceInfo}>
              <Text style={[styles.dockPriceEyebrow, { color: dark ? '#a1a1aa' : '#64748b' }]}>
                {isPaid ? 'TICKET PRICE' : 'ADMISSION'}
              </Text>
              <Text numberOfLines={1} style={[styles.dockPriceValue, { color: palette.text }]}>
                {priceDisplay}
              </Text>
            </View>
          </View>

          {/* Right Side: CTA Button or Cancelled Status */}
          <View style={styles.dockActionRow}>
            {event.status === 'CANCELLED' ? (
              <View style={styles.dockCancelledBadge}>
                <Text style={styles.dockCancelledText}>Event Cancelled</Text>
              </View>
            ) : (
              <Pressable
                onPress={handleBookPress}
                style={({ pressed }) => [
                  styles.stickyBookingButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Book Ticket"
              >
                <NativeIcon name="ticket" size={16} color="#ffffff" strokeWidth={2.4} />
                <Text style={styles.stickyBookingText}>Book Ticket</Text>
                <NativeIcon name="external-link" size={13} color="#ffffff" strokeWidth={2.6} />
              </Pressable>
            )}
          </View>
        </View>
      ) : null}

      {/* Booking Disclaimer Modal */}
      <BookingDisclaimerModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        onConfirm={handleConfirmBooking}
        event={event}
        dark={dark}
      />

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        event={event}
        dark={dark}
      />

      {/* Centered Zoomable Event Image Lightbox Modal */}
      <ZoomableImageViewer
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        image={image}
        title={event?.name || 'Event Image'}
        dark={dark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.gutter,
    paddingBottom: 40,
  },
  contentWithStickyDock: {
    paddingBottom: 96,
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  backPill: {
    borderRadius: radii.pill,
  },
  backPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sharePill: {
    borderRadius: radii.pill,
  },
  sharePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
  },
  posterCardWrapper: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  posterPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  enlargeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    zIndex: 10,
  },
  enlargeBadgeText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.4,
  },
  posterCardContent: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    width: '100%',
    height: '100%',
  },
  categoryJewel: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    zIndex: 10,
  },
  jewelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ea580c',
  },
  categoryJewelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: typography.headingFamily,
  },
  paidBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    zIndex: 10,
  },
  paidBadgeText: {
    color: '#fcd34d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: typography.headingFamily,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  cancelled: {
    padding: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,.3)',
    backgroundColor: 'rgba(244,63,94,.1)',
    marginBottom: spacing.md,
  },
  cancelledTitle: {
    color: '#e11d48',
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: typography.headingFamily,
  },
  cancelledText: {
    color: '#9f1239',
    fontSize: 13,
    fontFamily: typography.headingFamily,
  },
  infoPanelWrapper: {
    marginBottom: 10,
  },
  infoPanelContent: {
    paddingHorizontal: spacing.md,
  },
  organizerPanelWrapper: {
    marginBottom: spacing.lg,
  },
  organizerPanelContent: {
    paddingHorizontal: spacing.md,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.md,
  },
  organizerIconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: 'rgba(234,88,12,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInfo: {
    flex: 1,
    minWidth: 0,
  },
  organizerEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  organizerEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#ea580c',
    fontFamily: typography.headingFamily,
  },
  organizerName: {
    fontSize: 14.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    flexShrink: 1,
  },
  organizerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  organizerStatusMuted: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: typography.headingFamily,
  },
  organizerStatusDot: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  organizerStatusGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: typography.headingFamily,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: typography.headingFamily,
  },
  infoValue: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: typography.headingFamily,
  },
  tabsDockWrapper: {
    marginBottom: spacing.md,
  },
  tabsDockContent: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tabsScrollContent: {
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  activeTab: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 6,
  },
  inactiveTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13.5,
    fontFamily: typography.headingFamily,
  },
  pagerWrapper: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  pagerScrollView: {
    overflow: 'visible',
  },
  pagerContentContainer: {
    alignItems: 'stretch',
  },
  contentCardWrapper: {
    minHeight: 180,
  },
  contentCardContent: {
    padding: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionHeaderBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.28)',
  },
  sectionHeaderBadgeText: {
    color: '#ea580c',
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.8,
  },
  sectionSwipeCue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionSwipeCueText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.headingFamily,
  },
  sectionDivider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  nextSectionButton: {
    marginTop: spacing.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextSectionCopy: {
    flex: 1,
    marginRight: 12,
  },
  nextSectionEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: typography.headingFamily,
    marginBottom: 2,
  },
  nextSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
  },
  nextSectionArrowBox: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.orange,
  },
  sectionEndNotice: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  sectionEndNoticeText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: typography.headingFamily,
  },
  dotsDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    paddingVertical: 4,
  },
  dotTouchTarget: {
    padding: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveDot: {
    width: 6,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: 10,
    borderTopWidth: 1,
    overflow: 'hidden',
    ...shadows.glass,
  },
  dockPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  dockPriceIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(234,88,12,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockPriceInfo: {
    minWidth: 0,
    justifyContent: 'center',
  },
  dockPriceEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: typography.headingFamily,
  },
  dockPriceValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: -0.4,
  },
  dockActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  dockCancelledBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(244,63,94,.15)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,.3)',
  },
  dockCancelledText: {
    color: '#e11d48',
    fontSize: 12.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  stickyBookingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ea580c',
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 12,
    ...shadows.orange,
  },
  stickyBookingText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.3,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  errorDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
  retry: {
    backgroundColor: '#ea580c',
    borderRadius: radii.sm,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
  },
  skeleton: {
    gap: 14,
  },
  skeletonPoster: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
  },
  skeletonLine: {
    height: 22,
    borderRadius: 10,
  },
  skeletonPanel: {
    height: 180,
    borderRadius: radii.xl,
  },
  skeletonOrganizer: {
    height: 66,
    borderRadius: radii.xl,
    marginTop: -4,
  },
});
