import React, { useId } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
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
  intensity = 1,
  height = 1.5,
  style,
}: SpecularTopRimProps) {
  const rawId = useId();
  const gradId = `rim-${dark ? 'd' : 'l'}-${rawId.replace(/:/g, '')}`;
  const centerColor = dark
    ? `rgba(255, 255, 255, ${0.45 * intensity})`
    : `rgba(255, 255, 255, ${0.95 * intensity})`;
  const midColor = dark
    ? `rgba(255, 255, 255, ${0.20 * intensity})`
    : `rgba(255, 255, 255, ${0.65 * intensity})`;

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
            rx="85%"
            ry="45%"
            fx="50%"
            fy="0%"
          >
            <Stop
              offset="0%"
              stopColor="#ffffff"
              stopOpacity={dark ? 0.08 : 0.45}
            />
            <Stop
              offset="60%"
              stopColor="#ffffff"
              stopOpacity={dark ? 0.02 : 0.08}
            />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <SvgRect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

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
  blurTarget?: React.RefObject<View | null>;
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
  const effectiveBlurMethod: BlurMethod = blurTarget?.current
    ? (blurMethod ?? 'dimezisBlurViewSdk31Plus')
    : 'none';

  return (
    <View
      style={[
        styles.panelBase,
        {
          borderRadius,
          borderColor: borderColor ?? defaultBorder,
          backgroundColor: hasBlur ? 'transparent' : (tintColor ?? defaultBg),
        },
        style,
      ]}
    >
      {hasBlur && (
        <>
          <BlurView
            pointerEvents="none"
            intensity={intensity}
            tint={dark ? 'dark' : 'light'}
            blurMethod={effectiveBlurMethod}
            blurTarget={blurTarget}
            style={StyleSheet.absoluteFill}
          />
          {/* Subtle translucent tint over the blur so text remains crisp */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tintColor ?? (dark ? 'rgba(18, 20, 28, 0.45)' : 'rgba(255, 255, 255, 0.40)'),
              },
            ]}
          />
        </>
      )}

      {hasSheen && <GlassSheen dark={dark} />}
      {hasRim && <SpecularTopRim dark={dark} />}
      {children}
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
  blurTarget?: React.RefObject<View | null>;
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
  panelBase: {
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.glass,
  },
  titleIsland: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
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
