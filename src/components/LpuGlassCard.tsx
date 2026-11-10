import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Rect as SvgRect,
  Stop,
} from 'react-native-svg';
import { NativeIcon } from './NativeIcon';
import { typography } from '../design/tokens';
import type { EventFeedItem } from '../api/types';
import { eventImageSource } from '../features/homepageModels';
import { formatEventDateRange, formatEventTime, isPaidEvent } from '../features/eventHub';

export interface LpuGlassCardProps {
  /** Optional full event entity from LPU Events API */
  event?: EventFeedItem;
  /** Direct override or standalone props */
  title?: string;
  category?: string;
  date?: string;
  schedule?: string;
  venue?: string;
  organizer?: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  isTrending?: boolean;
  dark?: boolean;
  cardWidth?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LpuGlassCard = memo(function LpuGlassCard({
  event,
  title,
  category,
  date,
  schedule,
  venue,
  organizer,
  imageUrl,
  imageSource,
  isTrending,
  dark = false,
  cardWidth,
  onPress,
  style,
}: LpuGlassCardProps) {
  // Resolve values either from event payload or fallback props
  const resolvedTitle = event?.name ?? title ?? 'LPU Campus Event';
  const resolvedCategory = (
    event?.categories?.name ??
    category ??
    'CAMPUS EVENT'
  ).toUpperCase();
  const resolvedDate =
    event ? formatEventDateRange(event.start_at, event.end_at) : (date ?? 'Date TBA');
  const resolvedSchedule =
    event ? (formatEventTime(event.start_at) || 'Schedule TBA') : (schedule ?? 'Schedule TBA');
  const resolvedVenue = event?.venue_name ?? venue ?? 'LPU Campus';
  const resolvedOrganizer = event?.organizations?.name ?? organizer ?? 'LPU Organization';
  const resolvedIsTrending = event?.is_trending ?? isTrending ?? false;
  const resolvedIsPaid = isPaidEvent(event);
  const resolvedPriceTag =
    resolvedIsPaid && event?.price_amount !== undefined && event?.price_amount !== null && Number(event.price_amount) > 0
      ? `₹${event.price_amount}`
      : resolvedIsPaid
      ? 'PAID'
      : 'FREE';

  const resolvedImage =
    imageSource ??
    (event ? (eventImageSource(event) ?? undefined) : imageUrl ? { uri: imageUrl } : undefined);

  return (
    // TIER 1: Outer Shell — Native Bevel Rims & Specular Sheen (NO overflow: hidden, NO elevation)
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${resolvedTitle}`}
      style={({ pressed }) => [
        styles.outerContainer,
        dark ? styles.outerDark : styles.outerLight,
        cardWidth ? { width: cardWidth } : null,
        pressed && styles.pressedState,
        style,
      ]}
    >
      {/* TIER 2: Inner Clipping Shell — Strictly handles content clipping & rounded corners */}
      <View style={styles.innerClippedContainer}>
        {/* Hardware-Accelerated Frosted Glass Layer */}
        <BlurView
          pointerEvents="none"
          intensity={Platform.OS === 'android' ? 35 : 55}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* 16:9 Banner Media Stage */}
        <View style={styles.bannerStage}>
          {resolvedImage ? (
            <Image
              source={resolvedImage}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}

          {/* Smooth Bottom Vignette Gradient via SVG */}
          <Svg
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            width="100%"
            height="100%"
          >
            <Defs>
              <SvgGradient
                id={`cardVignette-${event?.id ?? 'custom'}`}
                x1="0"
                y1="0.35"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                <Stop offset="0.65" stopColor="#000000" stopOpacity="0.35" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.80" />
              </SvgGradient>
            </Defs>
            <SvgRect
              width="100%"
              height="100%"
              fill={`url(#cardVignette-${event?.id ?? 'custom'})`}
            />
          </Svg>

          {/* Top-Left Trending Badge */}
          {resolvedIsTrending && (
            <View style={styles.trendingBadge}>
              <View style={styles.trendingDot} />
              <Text style={styles.trendingText}>🔥 TRENDING</Text>
            </View>
          )}

          {/* Top-Right Pricing Badge (Parity with Student Website) */}
          <View
            style={[
              styles.pricingBadge,
              resolvedIsPaid ? styles.paidPricingBadge : styles.freePricingBadge,
            ]}
          >
            <NativeIcon
              name="ticket"
              size={11}
              color={resolvedIsPaid ? '#f59e0b' : '#10b981'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.pricingBadgeText,
                resolvedIsPaid ? styles.paidPricingBadgeText : styles.freePricingBadgeText,
              ]}
            >
              {resolvedPriceTag}
            </Text>
          </View>

          {/* Bottom Category Overlay Ribbon ("ACADEMICS") */}
          <View style={styles.categoryRibbon}>
            <Text numberOfLines={1} style={styles.categoryRibbonText}>
              {resolvedCategory}
            </Text>
          </View>
        </View>

        {/* Card Body Deck */}
        <View style={styles.cardBody}>
          {/* LPU Signature Orange Headline */}
          <Text
            numberOfLines={2}
            style={[styles.eventTitle, dark && styles.textWhite]}
          >
            {resolvedTitle}
          </Text>

          {/* Metadata Stack (Date, Schedule, Venue) */}
          <View style={styles.metaStack}>
            {/* 1. Date Row */}
            <View style={styles.metaRow}>
              <View style={[styles.iconWell, styles.iconWellOrange]}>
                <NativeIcon name="calendar" size={13} color="#ea580c" strokeWidth={2.4} />
              </View>
              <View style={styles.metaTextCol}>
                <Text style={styles.metaLabel}>DATE</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metaValue, dark && styles.textLight]}
                >
                  {resolvedDate}
                </Text>
              </View>
            </View>

            {/* 2. Schedule Row */}
            <View style={styles.metaRow}>
              <View style={[styles.iconWell, styles.iconWellAmber]}>
                <NativeIcon name="clock" size={13} color="#d97706" strokeWidth={2.4} />
              </View>
              <View style={styles.metaTextCol}>
                <Text style={styles.metaLabel}>SCHEDULE</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metaValue, dark && styles.textLight]}
                >
                  {resolvedSchedule}
                </Text>
              </View>
            </View>

            {/* 3. Venue Row */}
            <View style={styles.metaRow}>
              <View style={[styles.iconWell, styles.iconWellRose]}>
                <NativeIcon name="map-pin" size={13} color="#e11d48" strokeWidth={2.4} />
              </View>
              <View style={styles.metaTextCol}>
                <Text style={styles.metaLabel}>VENUE</Text>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[styles.metaValue, dark && styles.textLight]}
                >
                  {resolvedVenue}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Deck: "By Organizer" & CTA Pill */}
          <View
            style={[
              styles.footerRow,
              dark ? styles.footerBorderDark : styles.footerBorderLight,
            ]}
          >
            <View style={styles.organizerBlock}>
              <Text style={styles.organizerPrefix} numberOfLines={1}>
                By{' '}
                <Text
                  style={[styles.organizerName, dark && styles.textLight]}
                >
                  {resolvedOrganizer}
                </Text>
              </Text>
            </View>

            <View style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <NativeIcon name="arrow-right" size={12} color="#ffffff" strokeWidth={2.6} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

LpuGlassCard.displayName = 'LpuGlassCard';

const CARD_RADIUS = 26;

const styles = StyleSheet.create({
  /**
   * TIER 1: OUTER SHELL
   * - Substitutes native 'elevation' with layered differential borders.
   * - Top border is brighter and thicker (emulating web `inset 0 1px 0 0`).
   * - Absolutely NO `overflow: 'hidden'`.
   */
  outerContainer: {
    borderRadius: CARD_RADIUS,
    position: 'relative',
    marginVertical: 8,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',

    // Multi-Width Differential Specular Borders
    borderTopWidth: 1.6,
    borderLeftWidth: 1.1,
    borderRightWidth: 1.1,
    borderBottomWidth: 1.0,

    // Cross-Platform Fallback Shadows (Keeps elevation strictly at 0 on Android)
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 0, // CRITICAL: Eliminates Android RenderNode shadow bleed & inside box
      },
    }),
  },

  outerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.70)',
    borderRightColor: 'rgba(255, 255, 255, 0.70)',
    borderBottomColor: 'rgba(255, 255, 255, 0.45)',
  },

  outerDark: {
    backgroundColor: 'rgba(26, 28, 36, 0.78)',
    borderTopColor: 'rgba(255, 255, 255, 0.24)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },

  pressedState: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },

  /**
   * TIER 2: INNER CONTAINER
   * - Strictly handles child clipping without touching hardware shadow pipelines.
   */
  innerClippedContainer: {
    borderRadius: CARD_RADIUS - 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },

  // 16:9 Banner Media Stage
  bannerStage: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  bannerPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1e293b',
  },

  // Top-Left Trending Badge
  trendingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 10,
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
    letterSpacing: 0.5,
  },

  // Top-Right Pricing Badge
  pricingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 20,
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    zIndex: 10,
  },
  paidPricingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  freePricingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  pricingBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: typography.headingFamily,
  },
  paidPricingBadgeText: {
    color: '#fbbf24',
  },
  freePricingBadgeText: {
    color: '#34d399',
  },

  // Dark Category Overlay Ribbon ("ACADEMICS")
  categoryRibbon: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    zIndex: 10,
  },

  categoryRibbonText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  // Content Deck
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  // LPU Events Orange Title
  eventTitle: {
    color: '#c2410c',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  textWhite: {
    color: '#ffffff',
  },

  textLight: {
    color: '#f1f5f9',
  },

  // Metadata Stack
  metaStack: {
    gap: 9,
    marginBottom: 14,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  iconWell: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 1,
  },

  iconWellOrange: {
    backgroundColor: 'rgba(234, 88, 12, 0.10)',
    borderColor: 'rgba(234, 88, 12, 0.20)',
  },

  iconWellAmber: {
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    borderColor: 'rgba(217, 119, 6, 0.20)',
  },

  iconWellRose: {
    backgroundColor: 'rgba(225, 29, 72, 0.10)',
    borderColor: 'rgba(225, 29, 72, 0.20)',
  },

  metaTextCol: {
    flex: 1,
    justifyContent: 'center',
  },

  metaLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#64748b',
    lineHeight: 11,
    marginBottom: 1,
  },

  metaValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 16,
  },

  // Footer Section
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },

  footerBorderLight: {
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
  },

  footerBorderDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },

  organizerBlock: {
    flex: 1,
    marginRight: 8,
  },

  organizerPrefix: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  organizerName: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '800',
  },

  // CTA Pill
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ea580c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  viewDetailsText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
