import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicApiClient } from '../../src/api/publicApi';
import type { EventDetails } from '../../src/api/types';
import { eventImageSource } from '../../src/features/homepageModels';
import { formatEventDateRange, formatEventTimeRange } from '../../src/features/eventHub';
import { colors, radii, shadows, spacing, typography } from '../../src/design/tokens';
import { NativeIcon, type IconName } from '../../src/components/NativeIcon';
import { useTheme } from '../../src/theme/ThemeContext';
import { isSafeExternalUrl, openExternalUrl } from '../../src/utils/externalLinks';
import { BookingDisclaimerModal } from '../../src/components/BookingDisclaimerModal';
import { ShareModal } from '../../src/components/ShareModal';

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

function contentText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    for (const key of ['text', 'description', 'body', 'markdown']) {
      if (typeof record[key] === 'string') return (record[key] as string).trim();
    }
  }
  return '';
}

function SectionContent({ content, dark }: { content: unknown; dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  const text = contentText(content);
  if (text) {
    return (
      <View style={styles.contentText}>
        {text.split('\n').map((line, index) => {
          const clean = line.trim();
          if (!clean) return <View key={index} style={{ height: 10 }} />;
          const bullet = /^[-•*]\s+/.test(clean);
          const numbered = /^\d+[.)]\s+/.test(clean);
          return (
            <View key={index} style={bullet || numbered ? styles.listRow : undefined}>
              {bullet ? <Text style={[styles.bullet, { color: '#ea580c' }]}>•</Text> : null}
              <Text style={[styles.description, { color: palette.text }]}>
                {numbered ? clean.replace(/^\d+[.)]\s+/, '') : bullet ? clean.replace(/^[-•*]\s+/, '') : clean}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
  if (content && typeof content === 'object') {
    return (
      <View>
        {Object.entries(content as Record<string, unknown>).map(([key, value]) => (
          <View
            key={key}
            style={[
              styles.keyValue,
              {
                borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              },
            ]}
          >
            <Text style={[styles.infoLabel, { color: '#ea580c' }]}>{key.replace(/_/g, ' ')}</Text>
            <Text style={[styles.description, { color: palette.text }]}>
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <Text style={[styles.description, { color: palette.mutedText }]}>
      No detailed content has been provided for this section yet.
    </Text>
  );
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = Array.isArray(id) ? id[0] : id ?? '';
  const { dark } = useTheme();
  const palette = dark ? colors.dark : colors.light;
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('about');
  const [imageFailed, setImageFailed] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Swipe detection on the content panel to navigate tabs
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const load = useCallback(
    async (force = false) => {
      if (!eventId) {
        setLoading(false);
        setErrorMessage('A valid event identifier is required.');
        return;
      }
      if (force) setRefreshing(true);
      else setLoading(true);
      setErrorMessage(null);
      const result = await api.getEventDetails(eventId);
      if (result.data) {
        setEvent(result.data);
        setImageFailed(false);
      } else {
        setErrorMessage(
          result.error.code === 'HTTP_ERROR' && result.error.status === 404
            ? 'This event could not be found.'
            : result.error.message,
        );
      }
      setLoading(false);
      setRefreshing(false);
    },
    [eventId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const sections = useMemo(() => {
    const source = (event?.event_content_sections ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const about = source.find(
      (item) => /about|overview/i.test(item.title) || item.section_type.toUpperCase() === 'ABOUT',
    );
    return [
      { id: 'about', title: 'About the Event', content: contentText(about?.content) || event?.description || '' },
      ...source
        .filter((item) => item !== about)
        .map((item) => ({ id: item.id, title: item.title, content: item.content })),
    ];
  }, [event]);

  const currentSection = sections.find((item) => item.id === activeSection) ?? sections[0];
  const externalUrl = isSafeExternalUrl(event?.external_registration_url) ? event.external_registration_url : null;
  const image = event && !imageFailed ? eventImageSource(event) : undefined;
  const categoryName = (event?.categories?.name || 'CAMPUS EVENT').toUpperCase();

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

  // Touch swipe gesture handlers for tabs
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartXRef.current = e.nativeEvent.pageX;
    touchStartYRef.current = e.nativeEvent.pageY;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.nativeEvent.pageX - touchStartXRef.current;
    const diffY = e.nativeEvent.pageY - touchStartYRef.current;

    // Dominant horizontal swipe (> 45px)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      const currentIndex = sections.findIndex((s) => s.id === activeSection);
      if (diffX < 0 && currentIndex < sections.length - 1) {
        // Swiped left -> Next tab
        setActiveSection(sections[currentIndex + 1].id);
      } else if (diffX > 0 && currentIndex > 0) {
        // Swiped right -> Previous tab
        setActiveSection(sections[currentIndex - 1].id);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      {/* Background Layer with Dark Wash */}
      <ImageBackground
        source={require('../../assets/lpu-events-campus-glass-background.webp')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={styles.backgroundImage}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? 'rgba(14,14,18,.65)' : 'rgba(244,247,251,.04)' },
          ]}
        />
      </ImageBackground>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[styles.content, externalUrl ? styles.contentWithStickyDock : null]}
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
        {/* Top Bar with Back & Share Actions */}
        <View style={styles.topbar}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Back to events"
            style={[
              styles.back,
              {
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.90)',
                backgroundColor: dark ? 'rgba(30,30,36,0.85)' : 'rgba(255,255,255,0.85)',
              },
            ]}
          >
            <NativeIcon name="arrow-left" size={17} color={palette.text} strokeWidth={2.4} />
            <Text style={[styles.backText, { color: palette.text }]}>Back to events</Text>
          </Pressable>

          <Pressable
            onPress={() => setShareModalVisible(true)}
            accessibilityLabel="Share event"
            style={[
              styles.share,
              {
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.90)',
                backgroundColor: dark ? 'rgba(30,30,36,0.85)' : 'rgba(255,255,255,0.85)',
              },
            ]}
          >
            <NativeIcon name="share" size={16} color="#ea580c" strokeWidth={2.2} />
            <Text style={[styles.backText, { color: palette.text }]}>Share</Text>
          </Pressable>
        </View>

        {loading && !event ? <Skeleton dark={dark} /> : null}

        {!loading && !event ? (
          <View style={styles.center}>
            <Text style={[styles.errorTitle, { color: palette.text }]}>Event Not Found</Text>
            <Text style={[styles.description, { color: palette.mutedText }]}>
              {errorMessage ?? 'This event could not be found.'}
            </Text>
            <Pressable onPress={() => void load(true)} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {event ? (
          <>
            {/* 16:9 Banner Stage with Ambient Blur Backdrop (Matching Website) */}
            <View
              style={[
                styles.posterFrame,
                {
                  backgroundColor: dark ? 'rgba(26,26,32,0.92)' : 'rgba(255,255,255,0.92)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                },
              ]}
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

              {/* Pricing Pill Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {event.pricing_type === 'PAID' ? 'PAID EVENT' : 'FREE EVENT'}
                </Text>
              </View>
            </View>

            {/* Event Title with Dynamic Auto-Fit System */}
            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[styles.title, { color: palette.text }]}
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

            {/* Dedicated Verified Organizer Card (Matching Web Standalone Glass Box) */}
            <View
              style={[
                styles.organizerCard,
                {
                  backgroundColor: dark ? 'rgba(30,30,36,0.85)' : 'rgba(255,255,255,0.85)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)',
                },
              ]}
            >
              <View style={styles.organizerIconBox}>
                <NativeIcon name="users" size={19} color="#ea580c" strokeWidth={2.4} />
              </View>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerEyebrow}>ORGANIZED BY</Text>
                <View style={styles.organizerNameRow}>
                  <Text numberOfLines={1} style={[styles.organizerName, { color: palette.text }]}>
                    {event.organizations?.name || 'LPU Organization'}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <NativeIcon name="check" size={11} color="#ffffff" strokeWidth={3} />
                  </View>
                </View>
              </View>
            </View>

            {/* Schedule & Logistics Info Panel */}
            <View
              style={[
                styles.infoPanel,
                {
                  backgroundColor: dark ? 'rgba(30,30,36,0.85)' : 'rgba(255,255,255,0.85)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)',
                },
              ]}
            >
              <InfoRow icon="calendar" label="DATE" value={dateText(event)} dark={dark} tone="orange" />
              <InfoRow icon="clock" label="TIME" value={timeText(event)} dark={dark} tone="yellow" />
              <InfoRow icon="map-pin" label="VENUE" value={event.venue_name || 'LPU Campus'} dark={dark} tone="pink" last />
            </View>

            {/* Horizontal Scrollable Section Tabs (Matching Web Carousel) */}
            <View style={styles.tabsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContainer}
              >
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <Pressable
                      key={section.id}
                      onPress={() => setActiveSection(section.id)}
                      style={[
                        styles.tab,
                        isActive
                          ? styles.activeTab
                          : [
                              styles.inactiveTab,
                              {
                                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)',
                                borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
                              },
                            ],
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color: isActive ? '#ffffff' : palette.text,
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
            </View>

            {/* Content Panel with Horizontal Swipe Navigation */}
            <View
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={[
                styles.contentPanel,
                {
                  backgroundColor: dark ? 'rgba(30,30,36,0.92)' : 'rgba(255,255,255,0.92)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.95)',
                },
              ]}
            >
              <SectionContent content={currentSection?.content} dark={dark} />
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Floating Sticky Bottom CTA Dock (Direct One-Tap Access without Scrolling) */}
      {externalUrl && event ? (
        <View
          style={[
            styles.stickyBottomBar,
            {
              backgroundColor: dark ? 'rgba(20,20,26,0.94)' : 'rgba(255,255,255,0.94)',
              borderTopColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <Pressable
            onPress={handleBookPress}
            style={styles.stickyBookingButton}
            accessibilityRole="button"
            accessibilityLabel="Book Ticket"
          >
            <Text style={styles.stickyBookingText}>Book Ticket</Text>
            <NativeIcon name="arrow-up-right" size={17} color="#ffffff" strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={() => setShareModalVisible(true)}
            style={[
              styles.stickyShareButton,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)',
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Share Event"
          >
            <NativeIcon name="share" size={18} color="#ea580c" strokeWidth={2.4} />
          </Pressable>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.92,
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
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.sm,
    borderWidth: 1,
    ...shadows.glass,
  },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    ...shadows.glass,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
  },
  posterFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    ...shadows.glass,
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
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,.75)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    zIndex: 10,
  },
  badgeText: {
    color: '#fcd34d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
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
  },
  cancelledText: {
    color: '#9f1239',
    fontSize: 13,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.glass,
  },
  organizerIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(234,88,12,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInfo: {
    flex: 1,
    minWidth: 0,
  },
  organizerEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#ea580c',
    marginBottom: 2,
    fontFamily: typography.headingFamily,
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanel: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.glass,
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
  tabsWrapper: {
    marginBottom: spacing.sm,
  },
  tabsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.sm,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ea580c',
    ...shadows.orange,
  },
  inactiveTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontFamily: typography.headingFamily,
  },
  contentPanel: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.glass,
  },
  contentText: {
    gap: 4,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 24,
    fontWeight: '500',
  },
  listRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  keyValue: {
    padding: 12,
    borderWidth: 1,
    borderRadius: radii.sm,
    marginBottom: 8,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    ...shadows.glass,
  },
  stickyBookingButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ea580c',
    borderRadius: radii.pill,
    paddingVertical: 14,
    ...shadows.orange,
  },
  stickyBookingText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.3,
  },
  stickyShareButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 190,
    borderRadius: radii.md,
  },
});
