import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect as SvgRect, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';

export interface CampusBackgroundProps {
  dark?: boolean;
  blurred?: boolean;
  blurIntensity?: number;
}

/**
 * Global Full-Screen Campus Background Layer with Multi-Tier Progressive Ambient Diffusion
 *
 * Implements full-screen coverage with mathematically centered scaling,
 * combined with an ambient progressive gradient scrim that gently smooths
 * high-frequency background noise towards the feed.
 *
 * In `blurred` mode (matching the Student Website View Details background):
 * 1. Base photograph is blurred natively (CoreImage/RenderScript pre-rasterized).
 * 2. Dark mode ambient chromatic glow canvas injects violet, warm amber, and deep sapphire light.
 * 3. Optical diffusion layer (BlurView) softens composite luminance.
 * 4. Calibrated optical tint (rgba(255,255,255,0.20) in light / rgba(12,13,18,0.45) in dark)
 *    ensures high contrast and zero text distraction.
 */
export function CampusBackground({ dark = false, blurred = false, blurIntensity }: CampusBackgroundProps) {
  const windowDims = useWindowDimensions();
  const screenDims = Dimensions.get('screen');
  const width = windowDims.width;
  const height = Math.max(windowDims.height, screenDims.height);

  // Subtle overscale padding to prevent edge feathering when blurred
  const bleed = blurred ? 28 : 0;
  const targetWidth = width + bleed * 2;
  const targetHeight = height + bleed * 2;

  // The campus photograph is exactly 1600 x 900 (16:9 aspect ratio)
  const scale = Math.max(targetWidth / 1600, targetHeight / 900);
  const imageWidth = 1600 * scale;
  const imageHeight = 900 * scale;
  const imageLeft = (width - imageWidth) / 2;
  const imageTop = (height - imageHeight) / 2;

  const gradId = `bg-ambient-${dark ? 'dark' : 'light'}${blurred ? '-blur' : ''}`;
  const nativeBlurRadius = blurred
    ? (blurIntensity ?? (Platform.OS === 'ios' ? 24 : 18))
    : 0;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* 1. Base Campus Photograph with Hardware Accelerated Native Blur */}
      <Image
        source={require('../../assets/lpu-events-campus-glass-background.webp')}
        style={{
          position: 'absolute',
          width: imageWidth,
          height: imageHeight,
          left: imageLeft,
          top: imageTop,
        }}
        resizeMode="cover"
        blurRadius={nativeBlurRadius}
      />

      {/* 2. Dark Mode Ambient Canvas: Ethereal Violet, Warm Amber & Deep Sapphire Light Refraction */}
      {dark && blurred && (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Top Violet-Indigo Wash */}
            <RadialGradient id="top-violet-wash" cx="50%" cy="0%" rx="80%" ry="45%" fx="50%" fy="0%">
              <Stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
              <Stop offset="50%" stopColor="#a855f7" stopOpacity={0.10} />
              <Stop offset="100%" stopColor="#0e0e12" stopOpacity={0} />
            </RadialGradient>
            {/* Mid-Right Warm Amber LPU Glow */}
            <RadialGradient id="mid-amber-glow" cx="95%" cy="28%" r="60%" fx="95%" fy="28%">
              <Stop offset="0%" stopColor="#ff6b00" stopOpacity={0.18} />
              <Stop offset="65%" stopColor="#f59e0b" stopOpacity={0.06} />
              <Stop offset="100%" stopColor="#0e0e12" stopOpacity={0} />
            </RadialGradient>
            {/* Mid-Left Deep Sapphire Horizon */}
            <RadialGradient id="mid-sapphire-glow" cx="5%" cy="55%" r="55%" fx="5%" fy="55%">
              <Stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
              <Stop offset="60%" stopColor="#06b6d4" stopOpacity={0.06} />
              <Stop offset="100%" stopColor="#0e0e12" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <SvgRect width="100%" height="100%" fill="url(#top-violet-wash)" />
          <SvgRect width="100%" height="100%" fill="url(#mid-amber-glow)" />
          <SvgRect width="100%" height="100%" fill="url(#mid-sapphire-glow)" />
        </Svg>
      )}

      {/* 3. Progressive Ambient Diffusion Scrim */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={dark ? '#0e0e12' : '#ffffff'}
              stopOpacity={dark ? (blurred ? 0.58 : 0.52) : (blurred ? 0.20 : 0.12)}
            />
            <Stop
              offset="35%"
              stopColor={dark ? '#0e0e12' : '#f8fafc'}
              stopOpacity={dark ? (blurred ? 0.68 : 0.62) : (blurred ? 0.30 : 0.25)}
            />
            <Stop
              offset="70%"
              stopColor={dark ? '#0a0a0e' : '#f1f5f9'}
              stopOpacity={dark ? (blurred ? 0.78 : 0.78) : (blurred ? 0.48 : 0.50)}
            />
            <Stop
              offset="100%"
              stopColor={dark ? '#08080c' : '#e2e8f0'}
              stopOpacity={dark ? (blurred ? 0.88 : 0.88) : (blurred ? 0.68 : 0.72)}
            />
          </LinearGradient>
        </Defs>
        <SvgRect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>

      {/* 4. Optical Blur Layer & High-Legibility Color Tint (Matching Website .event-details-blur-layer) */}
      {blurred && (
        <>
          <BlurView
            pointerEvents="none"
            intensity={Platform.OS === 'ios' ? 40 : 25}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: dark
                  ? 'rgba(12, 13, 18, 0.45)'
                  : 'rgba(255, 255, 255, 0.20)',
              },
            ]}
          />
        </>
      )}
    </View>
  );
}
