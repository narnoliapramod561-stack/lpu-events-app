import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CampusBackground } from './CampusBackground';
import { LpuEventsLogo } from './LpuEventsLogo';
import { GlassSheen, SpecularTopRim } from './ui/NativeGlass';
import { useTheme } from '../theme/ThemeContext';

interface SplashScreenProps {
  onFinished: () => void;
}

/**
 * Premium Choreography Timings & Calibrated Fluid Easing
 * Derived from the authoritative Apple-grade cubic-bezier(0.22, 1, 0.36, 1) ease-out curve.
 * All layers and typographic elements run in a harmonized parallel cascade rather than
 * disjointed sequential queues.
 */
const ENTRANCE_DURATION = 520;
const LAYER_DURATION = 460;
const LAYER_STAGGER = 28;
const LPU_DELAY = 140;
const LPU_DURATION = 420;
const CONNECTOR_DELAY = 190;
const CONNECTOR_DURATION = 380;
const EVENTS_DELAY = 240;
const EVENTS_DURATION = 420;
const HERO_HOLD_DURATION = 340;
const HANDOFF_DURATION = 540;
const HANDOFF_FADE_DELAY = 280;
const HANDOFF_FADE_DURATION = 260;
const LUXURY_EASE = Easing.bezier(0.22, 1, 0.36, 1);

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const { dark } = useTheme();
  const logoSize = Math.min(280, Math.max(190, Math.min(width * 0.68, height * 0.38)));

  const entrance = useRef(new Animated.Value(0)).current;
  const layerProgress = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const lpuOpacity = useRef(new Animated.Value(0)).current;
  const connectorOpacity = useRef(new Animated.Value(0)).current;
  const eventsOpacity = useRef(new Animated.Value(0)).current;
  const handoffFade = useRef(new Animated.Value(1)).current;
  const handoffX = useRef(new Animated.Value(0)).current;
  const handoffY = useRef(new Animated.Value(0)).current;
  const handoffScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;

    const startup = Animated.sequence([
      // 1. Harmonized Parallel Assembly:
      // All circles and typography blossom together in a rhythmic, overlapping cascade.
      Animated.parallel([
        Animated.timing(entrance, {
          toValue: 1,
          duration: ENTRANCE_DURATION,
          easing: LUXURY_EASE,
          useNativeDriver: true,
        }),
        ...layerProgress.map((value, index) =>
          Animated.sequence([
            Animated.delay(index * LAYER_STAGGER),
            Animated.timing(value, {
              toValue: 1,
              duration: LAYER_DURATION,
              easing: LUXURY_EASE,
              useNativeDriver: true,
            }),
          ]),
        ),
        Animated.sequence([
          Animated.delay(LPU_DELAY),
          Animated.timing(lpuOpacity, {
            toValue: 1,
            duration: LPU_DURATION,
            easing: LUXURY_EASE,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(CONNECTOR_DELAY),
          Animated.timing(connectorOpacity, {
            toValue: 1,
            duration: CONNECTOR_DURATION,
            easing: LUXURY_EASE,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(EVENTS_DELAY),
          Animated.timing(eventsOpacity, {
            toValue: 1,
            duration: EVENTS_DURATION,
            easing: LUXURY_EASE,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 2. The Hero Breath:
      // Holds the pristine, fully-crystallized emblem in central focus so the user
      // perceives the complete brand identity with zero rush or jitter.
      Animated.delay(HERO_HOLD_DURATION),

      // 3. Fluid FLIP Handoff to Navbar:
      // Seamlessly translates, scales down, and dissolves the frosted backdrop into the header.
      Animated.parallel([
        Animated.timing(handoffX, {
          toValue: -(width / 2 - 16 - 21),
          duration: HANDOFF_DURATION,
          easing: LUXURY_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffY, {
          toValue: -(height / 2 - 8 - 21),
          duration: HANDOFF_DURATION,
          easing: LUXURY_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffScale, {
          toValue: 42 / logoSize,
          duration: HANDOFF_DURATION,
          easing: LUXURY_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffFade, {
          toValue: 0,
          duration: HANDOFF_FADE_DURATION,
          delay: HANDOFF_FADE_DELAY,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    startup.start(() => {
      if (active) onFinished();
    });

    return () => {
      active = false;
      startup.stop();
    };
  }, [
    connectorOpacity,
    entrance,
    eventsOpacity,
    handoffFade,
    handoffScale,
    handoffX,
    handoffY,
    height,
    layerProgress,
    logoSize,
    lpuOpacity,
    onFinished,
    width,
  ]);

  const logoScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const logoOpacity = entrance;
  const layerOpacities = layerProgress.map((progress, index) =>
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, index === 5 ? 0.96 : 1],
    }),
  );

  return (
    <Animated.View style={[styles.shell, { backgroundColor: dark ? '#0a0c10' : '#f7f9fc' }]} pointerEvents="none">
      {/* ─── SURROUNDING FULL-SCREEN FROSTED GLASS ATMOSPHERE ─── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: handoffFade }]}>
        <CampusBackground dark={dark} />

        {/* Hardware blur on iOS */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={20}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Top Surface Specular Sheen across entire canvas */}
        <GlassSheen dark={dark} />

        {/* Top Rim Light Reflection */}
        <SpecularTopRim dark={dark} height={1} />
      </Animated.View>

      {/* ─── PURE UNBOXED LOGO (CENTRAL ASSEMBLY & SMOOTH HANDOFF) ─── */}
      <Animated.View
        style={[
          styles.logoContainer,
          { width: logoSize, height: logoSize, marginLeft: -logoSize / 2, marginTop: -logoSize / 2 },
          {
            opacity: logoOpacity,
            transform: [
              { translateX: handoffX },
              { translateY: handoffY },
              { scale: logoScale },
              { scale: handoffScale },
            ],
          },
        ]}
      >
        <LpuEventsLogo
          size={logoSize}
          animatedOpacities={layerOpacities}
          lpuOpacity={lpuOpacity}
          connectorOpacity={connectorOpacity}
          eventsOpacity={eventsOpacity}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});

export default SplashScreen;
