import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { LinearGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import type { EventFeedItem, NativeCarouselItem } from '../api/types';
import { radii, shadows, spacing, typography } from '../design/tokens';
import { eventImageSource, mediaUrl } from '../features/homepageModels';
import { NativeIcon } from './NativeIcon';
import { SpecularTopRim } from './ui/NativeGlass';

interface NativeHeroCarouselProps {
  items: NativeCarouselItem[];
  featuredEvents: EventFeedItem[];
  dark: boolean;
  onSelectEvent: (id: string) => void;
}

interface Slide {
  id: string;
  title: string;
  description?: string;
  image: ImageSourcePropType | null;
  category: string;
  eventId?: string;
  ctaUrl?: string | null;
  duration: number;
}

function NativeHeroCarouselComponent({
  items,
  featuredEvents,
  dark,
  onSelectEvent,
}: NativeHeroCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.max(280, Math.round(windowWidth - spacing.gutter * 2));
  const cardHeight = Math.round((cardWidth * 2) / 3);

  const flatListRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = useMemo<Slide[]>(() => {
    const eventById = new Map(featuredEvents.map((event) => [event.id, event]));
    const list = items.filter((item) => item.is_active).flatMap<Slide>((item) => {
      if (item.item_type === 'EVENT') {
        const event = (item.event_id && eventById.get(item.event_id)) || item.events;
        if (!event) return [];
        return [{
          id: item.id,
          title: item.custom_title?.trim() || event.name,
          description: item.custom_subtitle?.trim() || event.description,
          image: eventImageSource(event),
          category: item.badge_text?.trim() || event.categories?.name || 'Featured Event',
          eventId: event.id,
          ctaUrl: item.custom_cta_url,
          duration: item.display_duration_ms || 5000,
        }];
      }
      return item.media_assets ? [{
        id: item.id,
        title: item.custom_title?.trim() || 'Campus Spotlight',
        description: item.custom_subtitle?.trim() || 'Featured university stories and announcements.',
        image: mediaUrl(item.media_assets)
          ? { uri: mediaUrl(item.media_assets)! }
          : require('../../assets/defaults/hero_default.webp'),
        category: item.badge_text?.trim() || 'Spotlight',
        ctaUrl: item.custom_cta_url,
        duration: item.display_duration_ms || 5000,
      }] : [];
    });

    if (!list.length && featuredEvents.length) {
      return featuredEvents.slice(0, 5).map((evt) => ({
        id: evt.id,
        title: evt.name,
        description: evt.description,
        image: eventImageSource(evt),
        category: evt.categories?.name || 'Featured Event',
        eventId: evt.id,
        duration: 5000,
      }));
    }
    return list;
  }, [featuredEvents, items]);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [index, slides.length]);

  const goTo = useCallback(
    (next: number, animated = true) => {
      if (!slides.length) return;
      const target = (next + slides.length) % slides.length;
      setInteracting(true);
      if (timer.current) clearTimeout(timer.current);
      setIndex(target);
      flatListRef.current?.scrollToOffset({
        offset: target * cardWidth,
        animated,
      });
      setTimeout(() => setInteracting(false), 500);
    },
    [cardWidth, slides.length]
  );

  // Auto-advance schedule
  useEffect(() => {
    if (slides.length <= 1 || interacting) return;
    const duration = slides[index]?.duration || 5000;
    timer.current = setTimeout(() => {
      const next = (index + 1) % slides.length;
      goTo(next, true);
    }, duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [goTo, index, interacting, slides]);

  const handleAction = useCallback(
    (slide: Slide) => {
      if (slide.ctaUrl) {
        const url = slide.ctaUrl.trim();
        if (/^https?:\/\//i.test(url)) {
          void Linking.openURL(url);
          return;
        }
      }
      if (slide.eventId) {
        onSelectEvent(slide.eventId);
      }
    },
    [onSelectEvent]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / cardWidth);
      if (newIndex >= 0 && newIndex < slides.length) {
        setIndex((prev) => (prev !== newIndex ? newIndex : prev));
      }
    },
    [cardWidth, slides.length]
  );

  const handleScrollBeginDrag = useCallback(() => {
    setInteracting(true);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => setInteracting(false), 2000);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / cardWidth);
      if (newIndex >= 0 && newIndex < slides.length) {
        setIndex((prev) => (prev !== newIndex ? newIndex : prev));
      }
      setInteracting(false);
    },
    [cardWidth, slides.length]
  );

  if (!slides.length) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Outer Container for Carousel and Edge Chevrons */}
      <View style={[styles.carouselContainer, { width: cardWidth, height: cardHeight }]}>
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled={Platform.OS === 'ios'}
          snapToInterval={cardWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          overScrollMode="never"
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_data, idx) => ({
            length: cardWidth,
            offset: cardWidth * idx,
            index: idx,
          })}
          style={[styles.flatList, { width: cardWidth, height: cardHeight }]}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => handleAction(item)}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: dark ? 'rgba(34,35,40,0.65)' : 'rgba(255,255,255,0.48)',
                  borderColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.82)',
                },
              ]}
            >
              <SpecularTopRim dark={dark} height={1.5} />
              {item.image ? (
                <>
                  {/* Ambient Refractive Blurred Backdrop */}
                  <Image
                    source={item.image}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                    blurRadius={24}
                  />
                  {/* Backdrop Tint Surface */}
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: dark ? 'rgba(0,0,0,0.45)' : 'rgba(15,23,42,0.30)',
                      },
                    ]}
                  />

                  {/* Crisp Centered Foreground Poster */}
                  <Image
                    source={item.image}
                    style={styles.foregroundImage}
                    resizeMode="contain"
                  />
                </>
              ) : (
                <View style={styles.fallbackContainer}>
                  <View
                    style={[
                      styles.fallbackPill,
                      {
                        backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(249,115,22,0.20)',
                        borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(249,115,22,0.30)',
                      },
                    ]}
                  >
                    <Text style={[styles.fallbackPillText, { color: dark ? '#ffffff' : '#ea580c' }]}>
                      CAMPUS EVENTS &amp; FESTIVITIES
                    </Text>
                  </View>
                  <Text numberOfLines={2} style={styles.fallbackTitle}>
                    {item.title}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        />

        {/* Side Navigation Chevrons (< and >) Centered Vertically on Outer Edges */}
        {slides.length > 1 && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
              onPress={() => goTo(index - 1)}
              style={[
                styles.sideArrowButton,
                styles.leftArrowButton,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.78)',
                  borderColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <NativeIcon
                name="chevron-left"
                size={16}
                strokeWidth={2.5}
                color={dark ? '#ffffff' : '#334155'}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next slide"
              onPress={() => goTo(index + 1)}
              style={[
                styles.sideArrowButton,
                styles.rightArrowButton,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.78)',
                  borderColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <NativeIcon
                name="chevron-right"
                size={16}
                strokeWidth={2.5}
                color={dark ? '#ffffff' : '#334155'}
              />
            </Pressable>
          </>
        )}
      </View>

      {/* Progress Dots — Centered Below the Card in Frosted Glass Capsule */}
      {slides.length > 1 && (
        <View style={styles.dotsWrapper}>
          <View
            style={[
              styles.dotsCapsule,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)',
                borderColor: dark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.85)',
              },
            ]}
          >
            {slides.map((_, dotIdx) => {
              const isActive = dotIdx === index;
              return (
                <Pressable
                  key={dotIdx}
                  onPress={() => goTo(dotIdx)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  accessibilityLabel={`Go to slide ${dotIdx + 1}`}
                  style={[
                    styles.capsuleDotBase,
                    isActive
                      ? styles.capsuleDotActive
                      : [
                          styles.capsuleDotInactive,
                          { backgroundColor: dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1' },
                        ],
                  ]}
                >
                  {isActive && (
                    <Svg width={24} height={8} style={StyleSheet.absoluteFill}>
                      <LinearGradient id="hero-dot-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#ff7a18" />
                        <Stop offset="100%" stopColor="#ea580c" />
                      </LinearGradient>
                      <SvgRect width={24} height={8} rx={4} ry={4} fill="url(#hero-dot-grad)" />
                    </Svg>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

export const NativeHeroCarousel = memo(NativeHeroCarouselComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  carouselContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glass,
  },
  foregroundImage: {
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: 8,
  },
  fallbackPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fallbackTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  sideArrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    zIndex: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  leftArrowButton: {
    left: -8,
  },
  rightArrowButton: {
    right: -8,
  },
  dotsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  dotsCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  capsuleDotBase: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  capsuleDotActive: {
    width: 24,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  capsuleDotInactive: {
    width: 8,
  },
});
