import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from '../src/components/SplashScreen';
import { HomeHeader } from '../src/components/HomeHeader';
import { NativeHeroCarousel } from '../src/components/NativeHeroCarousel';
import { HappeningTodayNative } from '../src/components/HappeningTodayNative';
import { DirectAdBanner } from '../src/components/DirectAdBanner';
import { EventHub } from '../src/components/EventHub';
import { NativeFooter } from '../src/components/NativeFooter';
import { colors, radii, spacing } from '../src/design/tokens';
import { PublicApiClient } from '../src/api/publicApi';
import type { EventFeedItem, HomepageBundle, NativeAdvertisement } from '../src/api/types';
import {
  normalizeAdSystemConfig,
  normalizeAdvertisements,
  normalizeCarouselItems,
  normalizeHappeningConfig,
  settingValue,
} from '../src/features/homepageModels';
import { useTheme } from '../src/theme/ThemeContext';

const api = new PublicApiClient();

const isToday = (event: EventFeedItem, now = new Date()) => {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return start < dayEnd && end >= dayStart;
};

function Skeleton({ dark }: { dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={styles.skeletonGroup}>
      <View style={[styles.skeletonHero, { backgroundColor: palette.surface2 }]} />
      <View style={[styles.skeletonTitle, { backgroundColor: palette.surface2 }]} />
      <View style={styles.skeletonRow}>
        {[0, 1].map((item) => <View key={item} style={[styles.skeletonCard, { backgroundColor: palette.surface2 }]} />)}
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
  const [eventHubQuery, setEventHubQuery] = useState('');
  const [categoriesOffset, setCategoriesOffset] = useState<number | null>(null);
  const [isSplashVisible, setSplashVisible] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const palette = dark ? colors.dark : colors.light;

  const loadHomepage = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    setErrorMessage(null);
    const result = forceRefresh ? await api.getHomepage(true) : await api.getHomepageWithSnapshot();
    if (result.data) {
      setBundle(result.data);
      setLoading(false);
      if (result.stale && !forceRefresh) {
        void api.getHomepage(true).then((fresh) => {
          if (fresh.data) setBundle(fresh.data);
        });
      }
    } else {
      setErrorMessage(result.error.message);
      setLoading(false);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void loadHomepage();
  }, [loadHomepage]);

  const advertisements = useMemo<NativeAdvertisement[]>(
    () => normalizeAdvertisements(bundle?.advertisements).filter(Boolean),
    [bundle?.advertisements],
  );
  const featuredEvents = useMemo(
    () => (bundle?.featured ?? []).flatMap((item) => {
      if (typeof item !== 'object' || item === null) return [];
      const candidate = 'events' in item ? item.events : item;
      return candidate && typeof candidate === 'object' ? [candidate as EventFeedItem] : [];
    }),
    [bundle?.featured],
  );
  const todayEvents = useMemo(
    () => (bundle?.events ?? []).filter((event) => event.status !== 'CANCELLED' && event.status !== 'DELETED' && !event.deleted_at && isToday(event)),
    [bundle?.events],
  );
  const adConfig = useMemo(() => normalizeAdSystemConfig(bundle ? settingValue(bundle, 'ad_system_config') : null), [bundle]);
  const happeningConfig = useMemo(() => normalizeHappeningConfig(bundle ? settingValue(bundle, 'happening_today_config') : null), [bundle]);

  const heroAd = useMemo(() => {
    const placement = adConfig?.placements.hero_carousel;
    if (!adConfig?.global_enabled || !placement?.enabled || placement.provider !== 'direct') return null;
    const id = placement.selected_ad_ids?.[0];
    return (id ? advertisements.find((ad) => ad.id === id) : advertisements[0]) ?? null;
  }, [adConfig, advertisements]);
  const carouselItems = useMemo(() => normalizeCarouselItems(bundle?.carousel), [bundle?.carousel]);

  const finishSplash = useCallback(() => setSplashVisible(false), []);
  const handleSelectEvent = useCallback((id: string) => {
    if (id.trim()) router.push({ pathname: '/events/[id]', params: { id } });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <ImageBackground source={require('../assets/lpu-events-campus-glass-background.webp')} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.backgroundImage}>
          <View style={[styles.backgroundWash, { backgroundColor: dark ? 'rgba(14,14,18,0.62)' : 'rgba(244,247,251,0.20)' }]} />
        </ImageBackground>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadHomepage(true)} tintColor={palette.primary} />}
      >
        <HomeHeader
          dark={dark}
          onToggleTheme={toggleTheme}
          onSearch={setEventHubQuery}
          onSelectCategories={() => {
            if (categoriesOffset !== null) {
              scrollRef.current?.scrollTo({ y: Math.max(0, categoriesOffset - spacing.md), animated: true });
            }
          }}
        />
        {loading && !bundle ? <Skeleton dark={dark} /> : null}
        {errorMessage && !bundle ? (
          <View style={[styles.error, { backgroundColor: palette.surface, borderColor: palette.outline }]}>
            <Text style={[styles.errorTitle, { color: palette.text }]}>Unable to load events</Text>
            <Text style={{ color: palette.mutedText }}>{errorMessage}</Text>
            <Pressable onPress={() => void loadHomepage(true)} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
          </View>
        ) : null}
        {bundle ? (
          <>
            <NativeHeroCarousel
              items={carouselItems}
              featuredEvents={featuredEvents}
              ads={advertisements}
              adConfig={adConfig}
              dark={dark}
              onSelectEvent={handleSelectEvent}
            />
            {heroAd ? <DirectAdBanner ad={heroAd} dark={dark} /> : null}
            <HappeningTodayNative
              events={todayEvents}
              ads={advertisements}
              adConfig={adConfig}
              dark={dark}
              onSelectEvent={handleSelectEvent}
              onViewAll={() => scrollRef.current?.scrollToEnd({ animated: true })}
            />
            <EventHub
              dark={dark}
              initialEvents={bundle.events}
              trendingEvents={bundle.trending}
              categoryData={bundle.categories}
              initialQuery={eventHubQuery}
              onSelectEvent={handleSelectEvent}
              onCategoriesLayout={setCategoriesOffset}
            />
            <NativeFooter
              dark={dark}
              onSelectCategories={() => {
                if (categoriesOffset !== null) {
                  scrollRef.current?.scrollTo({ y: Math.max(0, categoriesOffset - spacing.md), animated: true });
                }
              }}
            />
            {errorMessage ? <Text style={[styles.stale, { color: palette.mutedText }]}>Showing cached content. Refresh when you are back online.</Text> : null}
          </>
        ) : null}
        {!loading && bundle && !carouselItems.length && !featuredEvents.length && !todayEvents.length ? (
          <View style={[styles.empty, { backgroundColor: palette.surface }]}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No events available</Text>
            <Text style={{ color: palette.mutedText }}>Check back soon for new campus events.</Text>
          </View>
        ) : null}
      </ScrollView>
      </View>
      {isSplashVisible ? <SplashScreen onFinished={finishSplash} /> : null}
      {loading && !bundle ? <ActivityIndicator accessibilityLabel="Loading homepage" style={styles.loader} color={palette.primary} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },
  backgroundImage: { opacity: 0.92 },
  backgroundWash: { ...StyleSheet.absoluteFill },
  content: { paddingBottom: spacing.section },
  skeletonGroup: { marginHorizontal: spacing.gutter, marginTop: spacing.md },
  skeletonHero: { height: 230, borderRadius: radii.xl },
  skeletonTitle: { width: 150, height: 20, borderRadius: radii.xs, marginTop: spacing.section },
  skeletonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  skeletonCard: { flex: 1, height: 220, borderRadius: radii.xl },
  error: { margin: spacing.gutter, padding: spacing.lg, borderRadius: radii.lg, borderWidth: 1 },
  errorTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  retry: { alignSelf: 'flex-start', marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: '#f97316' },
  retryText: { color: '#fff', fontWeight: '800' },
  stale: { marginHorizontal: spacing.gutter, marginTop: spacing.md, fontSize: 12, fontWeight: '600' },
  empty: { margin: spacing.gutter, padding: spacing.lg, borderRadius: radii.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  loader: { position: 'absolute', top: 100, alignSelf: 'center' },
});
