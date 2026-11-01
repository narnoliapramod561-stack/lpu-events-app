import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from '../src/components/SplashScreen';
import { HomeHeader } from '../src/components/HomeHeader';
import { NativeHeroCarousel } from '../src/components/NativeHeroCarousel';
import { HappeningTodayNative } from '../src/components/HappeningTodayNative';
import { EventHub } from '../src/components/EventHub';
import { NativeFooter } from '../src/components/NativeFooter';
import { MaintenanceView } from '../src/components/MaintenanceView';
import { SiteNoticeBanner } from '../src/components/SiteNoticeBanner';
import { colors, glass, radii, spacing } from '../src/design/tokens';
import { PublicApiClient } from '../src/api/publicApi';
import type { EventFeedItem, HomepageBundle } from '../src/api/types';
import {
  normalizeCarouselItems,
  settingValue,
} from '../src/features/homepageModels';
import { useTheme } from '../src/theme/ThemeContext';
import { isEventToday, type TimelineFilter } from '../src/features/eventHub';

const api = new PublicApiClient();

function Skeleton({ dark }: { dark: boolean }) {
  const g = dark ? glass.dark : glass.light;
  return (
    <View style={styles.skeletonGroup}>
      <View
        style={[
          styles.skeletonHero,
          { backgroundColor: g.panelBg, borderColor: g.border, borderWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.skeletonTitle,
          { backgroundColor: g.pillBg, borderColor: g.pillBorder, borderWidth: 1 },
        ]}
      />
      <View style={styles.skeletonRow}>
        {[0, 1].map((item) => (
          <View
            key={item}
            style={[
              styles.skeletonCard,
              { backgroundColor: g.cardBg, borderColor: g.border, borderWidth: 1 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { dark, toggleTheme } = useTheme();
  const [bundle, setBundle] = useState<HomepageBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [eventHubQuery, setEventHubQuery] = useState('');
  const [categoriesOffset, setCategoriesOffset] = useState<number | null>(null);
  const [forcedTimeline, setForcedTimeline] = useState<TimelineFilter | undefined>(undefined);
  const [isSplashVisible, setSplashVisible] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const blurTarget = useRef<View | null>(null);
  const [blurTargetReady, setBlurTargetReady] = useState(false);
  const palette = dark ? colors.dark : colors.light;

  const loadHomepage = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    setErrorMessage(null);
    setErrorCode(null);
    try {
      const result = await api.getHomepage(forceRefresh);
      if (result.data) {
        setBundle(result.data);
        setLoading(false);
        if (result.stale && !forceRefresh) {
          void api.getHomepage(true).then((fresh) => {
            if (fresh.data && !fresh.notModified) {
              setBundle(fresh.data);
            }
          });
        }
      } else {
        // Offline fallback: try static snapshot if live API failed
        const snapshotResult = await api.getHomepageSnapshot();
        if (snapshotResult.data) {
          setBundle(snapshotResult.data);
          setLoading(false);
        } else {
          setErrorMessage(result.error?.message || 'Unable to load events');
          setErrorCode(result.error?.code || 'UNKNOWN');
          setLoading(false);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to refresh events');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHomepage();
  }, [loadHomepage]);

  // Check Maintenance Mode
  const maintenanceConfig = useMemo(() => {
    if (!bundle) return null;
    const setting = settingValue(bundle, 'platform_maintenance_mode');
    if (typeof setting === 'boolean' && setting) return { enabled: true };
    if (typeof setting === 'object' && setting !== null) {
      const rec = setting as Record<string, unknown>;
      if (rec.enabled === true || rec.is_enabled === true) return rec;
    }
    return null;
  }, [bundle]);

  const isMaintenanceActive = Boolean(maintenanceConfig) || errorCode === 'MAINTENANCE';

  // Campus Announcement Banner
  const siteBannerData = useMemo(() => {
    if (!bundle) return null;
    return settingValue(bundle, 'site_notice_banner');
  }, [bundle]);

  const featuredEvents = useMemo(
    () =>
      (bundle?.featured ?? []).flatMap((item) => {
        if (typeof item !== 'object' || item === null) return [];
        const candidate = 'events' in item ? (item as any).events : item;
        return candidate && typeof candidate === 'object' ? [candidate as EventFeedItem] : [];
      }),
    [bundle?.featured],
  );

  const todayEvents = useMemo(() => {
    const published = (bundle?.events ?? []).filter(
      (event) =>
        event &&
        event.status === 'PUBLISHED' &&
        !event.deleted_at &&
        isEventToday(event.start_at, event.end_at),
    );
    return published.slice().sort((a, b) => {
      const aTime = a.start_at ? new Date(a.start_at).getTime() : 0;
      const bTime = b.start_at ? new Date(b.start_at).getTime() : 0;
      return aTime - bTime;
    });
  }, [bundle?.events]);

  const carouselItems = useMemo(
    () => normalizeCarouselItems(bundle?.carousel),
    [bundle?.carousel],
  );

  const finishSplash = useCallback(() => setSplashVisible(false), []);
  const handleSelectEvent = useCallback((id: string) => {
    if (id.trim()) router.push({ pathname: '/events/[id]', params: { id } });
  }, []);

  const handleSelectCategories = () => {
    if (categoriesOffset !== null) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, categoriesOffset - spacing.md),
        animated: true,
      });
    }
  };

  const isSearching = eventHubQuery.trim().length >= 2;

  // Render Full Maintenance View if active
  if (isMaintenanceActive && !loading) {
    return (
      <MaintenanceView
        onRetry={() => void loadHomepage(true)}
        message={typeof maintenanceConfig?.message === 'string' ? maintenanceConfig.message : undefined}
        description={
          typeof maintenanceConfig?.description === 'string' ? maintenanceConfig.description : undefined
        }
        estimatedResumption={
          typeof maintenanceConfig?.estimated_resumption === 'string'
            ? maintenanceConfig.estimated_resumption
            : null
        }
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.page}>
        <BlurTargetView
          ref={blurTarget}
          onLayout={() => setBlurTargetReady(true)}
          style={StyleSheet.absoluteFill}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <ImageBackground
              source={require('../assets/lpu-events-campus-glass-background.webp')}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
              imageStyle={styles.backgroundImage}
            >
              {dark ? <View style={styles.backgroundWash} /> : null}
            </ImageBackground>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadHomepage(true)}
                tintColor={palette.primary}
                colors={[palette.primary]}
                progressBackgroundColor={dark ? '#1c1c22' : '#ffffff'}
                progressViewOffset={Platform.OS === 'android' ? 68 : 0}
              />
            }
          >
            {/* Campus Announcement Banner */}
            <SiteNoticeBanner bannerData={siteBannerData} dark={dark} />

            {loading && !bundle ? <Skeleton dark={dark} /> : null}
            {errorMessage && !bundle ? (
              <View
                style={[
                  styles.error,
                  { backgroundColor: dark ? glass.dark.cardBg : glass.light.cardBg, borderColor: dark ? glass.dark.border : glass.light.border },
                ]}
              >
                <Text style={[styles.errorTitle, { color: palette.text }]}>
                  Unable to load events
                </Text>
                <Text style={{ color: palette.mutedText }}>{errorMessage}</Text>
                <Pressable onPress={() => void loadHomepage(true)} style={styles.retry}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : null}

            {bundle ? (
              <>
                {/* Hide top carousel and happening today during active search, matching website */}
                {!isSearching ? (
                  <>
                    <NativeHeroCarousel
                      items={carouselItems}
                      featuredEvents={featuredEvents}
                      dark={dark}
                      onSelectEvent={handleSelectEvent}
                    />
                    <HappeningTodayNative
                      events={todayEvents}
                      dark={dark}
                      onSelectEvent={handleSelectEvent}
                    />
                  </>
                ) : null}

                <EventHub
                  dark={dark}
                  initialEvents={bundle.events}
                  trendingEvents={bundle.trending}
                  categoryData={bundle.categories}
                  initialQuery={eventHubQuery}
                  onSelectEvent={handleSelectEvent}
                  onCategoriesLayout={setCategoriesOffset}
                  forcedTimeline={forcedTimeline}
                />

                <NativeFooter
                  dark={dark}
                  onSelectCategories={handleSelectCategories}
                />

                {errorMessage ? (
                  <Text style={[styles.stale, { color: palette.mutedText }]}>
                    Showing cached content. Refresh when you are back online.
                  </Text>
                ) : null}
              </>
            ) : null}

            {!loading &&
            bundle &&
            !carouselItems.length &&
            !featuredEvents.length &&
            !todayEvents.length &&
            !bundle.events.length ? (
              <View
                style={[
                  styles.empty,
                  {
                    backgroundColor: dark ? glass.dark.cardBg : glass.light.cardBg,
                    borderColor: dark ? glass.dark.border : glass.light.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.emptyTitle, { color: palette.text }]}>No events available</Text>
                <Text style={{ color: palette.mutedText }}>
                  Check back soon for new campus events.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </BlurTargetView>

        <HomeHeader
          key={`header-${blurTargetReady ? 'ready' : 'init'}-${dark ? 'dark' : 'light'}`}
          style={styles.fixedHeader}
          blurTarget={blurTarget}
          dark={dark}
          onToggleTheme={toggleTheme}
          onSearch={setEventHubQuery}
          onSelectCategories={handleSelectCategories}
          onSelectTrending={() => {
            if (categoriesOffset !== null) {
              scrollRef.current?.scrollTo({
                y: Math.max(0, categoriesOffset - spacing.md),
                animated: true,
              });
            }
          }}
          onSelectEvent={handleSelectEvent}
          allEvents={bundle?.events || []}
          onRefresh={() => void loadHomepage(true)}
        />
      </View>
      {isSplashVisible ? <SplashScreen onFinished={finishSplash} /> : null}
      {loading && !bundle ? (
        <ActivityIndicator
          accessibilityLabel="Loading homepage"
          style={styles.loader}
          color={palette.primary}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },
  backgroundImage: { opacity: 1 },
  backgroundWash: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14,14,18,0.62)' },
  scroll: { flex: 1 },
  content: { paddingTop: 64, paddingBottom: spacing.section },
  fixedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, elevation: 5 },
  skeletonGroup: { marginHorizontal: spacing.gutter, marginTop: spacing.md },
  skeletonHero: { height: 230, borderRadius: radii.xl },
  skeletonTitle: { width: 150, height: 20, borderRadius: radii.xs, marginTop: spacing.section },
  skeletonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  skeletonCard: { flex: 1, height: 220, borderRadius: radii.xl },
  error: { margin: spacing.gutter, padding: spacing.lg, borderRadius: radii.lg, borderWidth: 1 },
  errorTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  retry: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: '#ff6b00',
  },
  retryText: { color: '#fff', fontWeight: '800' },
  stale: { marginHorizontal: spacing.gutter, marginTop: spacing.md, fontSize: 12, fontWeight: '600' },
  empty: { margin: spacing.gutter, padding: spacing.lg, borderRadius: radii.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  loader: { position: 'absolute', top: 100, alignSelf: 'center' },
});
