import React, { useId } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect as SvgRect, Stop, RadialGradient } from 'react-native-svg';
import { BlurView, type BlurMethod } from 'expo-blur';
import { glass, radii, shadows } from '../../design/tokens';

export interface SpecularTopRimProps {
  dark?: boolean;
  intensity?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Apple VisionOS / macOS Control Center 1px-1.5px Specular Light Reflection Rim.
 * Captures simulated light on the top edge of glass panels and cards.
 */
export function SpecularTopRim({
  dark = false,
  intensity = 0.6,
  height = 1,
  style,
}: SpecularTopRimProps) {
  const rawId = useId();
  const gradId = `rim-${dark ? 'd' : 'l'}-${rawId.replace(/:/g, '')}`;
  const centerColor = dark
    ? `rgba(255, 255, 255, ${0.28 * intensity})`
    : `rgba(255, 255, 255, ${0.60 * intensity})`;
  const midColor = dark
    ? `rgba(255, 255, 255, ${0.12 * intensity})`
    : `rgba(255, 255, 255, ${0.35 * intensity})`;

  return (
    <View
      pointerEvents="none"
      style={[styles.specularRimWrap, { height }, style]}
    >
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
            <Stop offset="20%" stopColor={midColor} stopOpacity={1} />
            <Stop offset="50%" stopColor={centerColor} stopOpacity={1} />
            <Stop offset="80%" stopColor={midColor} stopOpacity={1} />
            <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <SvgRect width="100%" height={height} fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

/**
 * Top Surface Specular Sheen (mimics .glass-card::before radial-gradient).
 */
export function GlassSheen({ dark = false }: { dark?: boolean }) {
  const rawId = useId();
  const gradId = `sheen-${dark ? 'd' : 'l'}-${rawId.replace(/:/g, '')}`;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id={gradId}
            cx="50%"
            cy="0%"
            r="80%"
            fx="50%"
            fy="0%"
          >
            <Stop
              offset="0%"
              stopColor="#ffffff"
              stopOpacity={dark ? 0.03 : 0.09}
            />
            <Stop
              offset="60%"
              stopColor="#ffffff"
              stopOpacity={dark ? 0.01 : 0.02}
            />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <SvgRect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

export interface LiquidGlassCardProps {
  dark?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  hasSheen?: boolean;
  hasRim?: boolean;
  hasBlur?: boolean;
  intensity?: number;
  tintColor?: string;
  borderColor?: string;
  shadow?: boolean;
}

/**
 * Enterprise Liquid Glass Card with Multi-Tier Wrapper Architecture.
 *
 * Solves Android 1px subpixel clipping fringing, inner-box shadow artifacts,
 * and elevation clipping by separating shadow casting, radius masking,
 * vector specular rims, and hairline stroke overlays into dedicated render layers.
 */
export function LiquidGlassCard({
  dark = false,
  children,
  style,
  contentStyle,
  borderRadius = radii.lg,
  hasSheen = true,
  hasRim = true,
  hasBlur = false,
  intensity = 60,
  tintColor,
  borderColor,
  shadow = true,
}: LiquidGlassCardProps) {
  const defaultBg = dark ? glass.dark.panelBg : glass.light.panelBg;
  const defaultBorder = dark ? glass.dark.border : glass.light.border;

  return (
    <View style={[shadow ? styles.cardShadowTier : undefined, style]}>
      {/* Tier 2: Rounded Mask Container */}
      <View
        style={[
          styles.cardMaskTier,
          {
            borderRadius,
            backgroundColor: hasBlur ? 'transparent' : (tintColor ?? defaultBg),
          },
        ]}
      >
        {hasBlur && (
          <BlurView
            pointerEvents="none"
            intensity={intensity}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        {hasBlur && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tintColor ?? (dark ? 'rgba(18, 20, 28, 0.45)' : 'rgba(255, 255, 255, 0.40)'),
              },
            ]}
          />
        )}

        {hasSheen && <GlassSheen dark={dark} />}
        {hasRim && <SpecularTopRim dark={dark} height={1.2} intensity={0.9} />}

        {/* Tier 4: Hairline Stroke Overlay — cleanly sits on top without subpixel clipping fringing */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: borderColor ?? defaultBorder,
            },
          ]}
        />

        {/* Tier 5: Content Layer */}
        {contentStyle ? (
          <View style={contentStyle}>{children}</View>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

export const AndroidLiquidGlassCard = LiquidGlassCard;

export interface NativeGlassSurfaceProps {
  dark: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  hasSheen?: boolean;
  hasRim?: boolean;
  hasBlur?: boolean;
  intensity?: number;
  blurMethod?: BlurMethod;
  blurTarget?: React.RefObject<React.ElementRef<typeof View> | null>;
  tintColor?: string;
  borderColor?: string;
}

/**
 * Enterprise Native Glass Surface.
 * Handles hardware backdrop blur on iOS / Android SDK 31+,
 * combined with VisionOS specular highlights, optical sheen, and graceful fallbacks.
 */
export function NativeGlassSurface({
  dark,
  children,
  style,
  borderRadius = radii.xl,
  hasSheen = true,
  hasRim = true,
  hasBlur = false,
  intensity = 60,
  blurMethod,
  blurTarget,
  tintColor,
  borderColor,
}: NativeGlassSurfaceProps) {
  const defaultBg = dark ? glass.dark.panelBg : glass.light.panelBg;
  const defaultBorder = dark ? glass.dark.border : glass.light.border;

  const flattened = StyleSheet.flatten(style) || {};
  const {
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    flex,
    flexGrow,
    flexShrink,
    alignSelf,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    ...restInnerStyle
  } = flattened as ViewStyle;

  const outerLayoutStyle: ViewStyle = {
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    flex,
    flexGrow,
    flexShrink,
    alignSelf,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
  };

  return (
    <View style={[styles.panelShadowTier, outerLayoutStyle]}>
      <View
        style={[
          styles.panelMaskTier,
          {
            borderRadius,
            backgroundColor: hasBlur ? 'transparent' : (tintColor ?? defaultBg),
          },
          restInnerStyle,
        ]}
      >
        {hasBlur && (
          <BlurView
            pointerEvents="none"
            intensity={intensity}
            tint={dark ? 'dark' : 'light'}
            blurTarget={blurTarget}
            blurMethod={blurTarget ? (blurMethod ?? 'dimezisBlurViewSdk31Plus') : undefined}
            style={StyleSheet.absoluteFill}
          />
        )}
        {hasBlur && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tintColor ?? (dark ? 'rgba(18, 20, 28, 0.45)' : 'rgba(255, 255, 255, 0.40)'),
              },
            ]}
          />
        )}

        {hasSheen && <GlassSheen dark={dark} />}
        {hasRim && <SpecularTopRim dark={dark} />}

        {/* Outer Hairline Stroke Overlay: Eliminates the 1px inner-box shadow artifact on Android */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: borderColor ?? defaultBorder,
            },
          ]}
        />
        {children}
      </View>
    </View>
  );
}

export interface GlassPanelProps {
  dark: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  hasSheen?: boolean;
  hasRim?: boolean;
  hasBlur?: boolean;
  blurTarget?: React.RefObject<React.ElementRef<typeof View> | null>;
}

/**
 * Apple Control Center / VisionOS Translucent Glass Panel
 */
export function GlassPanel({
  dark,
  children,
  style,
  borderRadius = radii.xl,
  hasSheen = true,
  hasRim = true,
  hasBlur = false,
  blurTarget,
}: GlassPanelProps) {
  return (
    <NativeGlassSurface
      dark={dark}
      borderRadius={borderRadius}
      hasSheen={hasSheen}
      hasRim={hasRim}
      hasBlur={hasBlur}
      blurTarget={blurTarget}
      style={style}
    >
      {children}
    </NativeGlassSurface>
  );
}

export interface GlassTitleIslandProps {
  dark: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Frosted Translucent Title Island for Section Headings
 * (Matching Website .glass-title-island)
 */
export function GlassTitleIsland({
  dark,
  children,
  style,
}: GlassTitleIslandProps) {
  return (
    <View
      style={[
        styles.titleIsland,
        {
          backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
          borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
        },
        style,
      ]}
    >
      <SpecularTopRim dark={dark} height={1.2} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  specularRimWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  panelShadowTier: {
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  panelMaskTier: {
    overflow: 'hidden',
    position: 'relative',
  },
  cardShadowTier: {
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardMaskTier: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  titleIsland: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.glass,
  },
});
