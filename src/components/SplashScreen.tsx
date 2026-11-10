import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export interface SplashScreenProps {
  onFinished: () => void;
}

/**
 * Calibrated Luxury Easing Curves
 * - LUXURY_ENTRANCE: Decelerating cubic-bezier mimicking optical aperture physics
 * - SHEEN_EASE: Natural fluid light transit across curved glass
 * - FLIGHT_EASE: Apple-grade asymptotic shared-element docking curve
 */
const LUXURY_ENTRANCE = Easing.bezier(0.12, 1, 0.28, 1);
const SHEEN_EASE = Easing.bezier(0.35, 0, 0.15, 1);
const FLIGHT_EASE = Easing.bezier(0.22, 1, 0.36, 1);

// Deliberate, Staged Luxury Choreography Timings (~2.25s Total Experience)
const ACT1_CONVERGENCE_DURATION = 650;
const ACT2_LENS_FUSION_DELAY = 220;
const ACT2_LENS_FUSION_DURATION = 580;
const ACT3_SHEEN_DELAY = 820;
const ACT3_SHEEN_DURATION = 640;
const ACT4_FLIGHT_DELAY = 1680; // Allows 860ms to admire the crystallized, gleaming jewel
const ACT4_FLIGHT_DURATION = 560;
const FADE_DISSOLVE_DELAY = 1860;
const FADE_DISSOLVE_DURATION = 380;

const logoFontFamily = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'sans-serif',
});

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();

  // Emblem Dimensions & Precise Sub-pixel Navbar Target
  const logoSize = Math.min(280, Math.max(190, Math.min(width * 0.68, height * 0.36)));
  const targetSize = 42;
  const targetScale = targetSize / logoSize;

  const startCenterX = width / 2;
  const startCenterY = height / 2;
  const destCenterX = 16 + targetSize / 2;
  const destCenterY = insets.top + 8 + 26;

  const deltaX = destCenterX - startCenterX;
  const deltaY = destCenterY - startCenterY;

  // 100% Native Driver Animated Values
  const convergenceAnim = useRef(new Animated.Value(0)).current; // Act I: Vector convergence
  const fusionAnim = useRef(new Animated.Value(0)).current;      // Act II: Central glass lens & typography
  const sheenAnim = useRef(new Animated.Value(0)).current;       // Act III: Specular light beam sweep
  const flightAnim = useRef(new Animated.Value(0)).current;      // Act IV: Fluid FLIP flight to navbar
  const shellFade = useRef(new Animated.Value(1)).current;       // Clean atmosphere cross-fade

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      if (!active) return;
      if (reducedMotion) {
        Animated.timing(shellFade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          if (active) onFinished();
        });
        return;
      }

      // Symphonic Multi-Stage Choreography
      const orchestration = Animated.parallel([
        // ─── ACT I: SPATIAL VECTOR CONVERGENCE (0ms – 650ms) ───
        Animated.timing(convergenceAnim, {
          toValue: 1,
          duration: ACT1_CONVERGENCE_DURATION,
          easing: LUXURY_ENTRANCE,
          useNativeDriver: true,
        }),

        // ─── ACT II: LENS CRYSTALLIZATION & TYPOGRAPHY (220ms – 800ms) ───
        Animated.sequence([
          Animated.delay(ACT2_LENS_FUSION_DELAY),
          Animated.timing(fusionAnim, {
            toValue: 1,
            duration: ACT2_LENS_FUSION_DURATION,
            easing: LUXURY_ENTRANCE,
            useNativeDriver: true,
          }),
        ]),

        // ─── ACT III: THE SPECULAR LIGHT SWEEP (820ms – 1460ms) ───
        Animated.sequence([
          Animated.delay(ACT3_SHEEN_DELAY),
          Animated.timing(sheenAnim, {
            toValue: 1,
            duration: ACT3_SHEEN_DURATION,
            easing: SHEEN_EASE,
            useNativeDriver: true,
          }),
        ]),

        // ─── ACT IV: KINETIC FLIP GLIDE TO NAVBAR (1680ms – 2240ms) ───
        Animated.sequence([
          Animated.delay(ACT4_FLIGHT_DELAY),
          Animated.timing(flightAnim, {
            toValue: 1,
            duration: ACT4_FLIGHT_DURATION,
            easing: FLIGHT_EASE,
            useNativeDriver: true,
          }),
        ]),

        // ─── BACKDROP DISSOLVE INTO HOMESCREEN (1860ms – 2240ms) ───
        Animated.sequence([
          Animated.delay(FADE_DISSOLVE_DELAY),
          Animated.timing(shellFade, {
            toValue: 0,
            duration: FADE_DISSOLVE_DURATION,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]);

      orchestration.start(() => {
        if (active) onFinished();
      });
    });

    return () => {
      active = false;
    };
  }, [
    convergenceAnim,
    fusionAnim,
    sheenAnim,
    flightAnim,
    shellFade,
    onFinished,
  ]);

  // ─── SPATIAL VECTOR INTERPOLATIONS ───
  // Navy spheres glide inward from South-West (-14px X, +10px Y)
  const navyTranslateX = convergenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });
  const navyTranslateY = convergenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  // Orange spheres glide inward from North-East (+14px X, -10px Y)
  const orangeTranslateX = convergenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });
  const orangeTranslateY = convergenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  // Spheres expand from subtle compression (0.91 -> 1.0)
  const spheresScale = convergenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.91, 1],
  });
  const spheresOpacity = convergenceAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.8, 1],
  });

  // Central dark glass lens materializes with slight optical pop
  const lensScale = fusionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const lensOpacity = fusionAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 1],
  });

  // Typography ascends gracefully with depth
  const typoTranslateY = fusionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const typoOpacity = fusionAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 1],
  });

  // Specular light beam sweeping across the circular lens
  const sheenTranslate = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoSize * 1.1, logoSize * 1.6],
  });
  const sheenOpacity = sheenAnim.interpolate({
    inputRange: [0, 0.25, 0.75, 1],
    outputRange: [0, 0.65, 0.65, 0],
  });

  // Flight Transforms (Translate + Scale down to 42pt navbar icon)
  const flightX = flightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, deltaX],
  });
  const flightY = flightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, deltaY],
  });
  const flightScale = flightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, targetScale],
  });

  return (
    <View style={styles.shell} pointerEvents="none">
      {/* ─── DUAL-TONE ATMOSPHERIC AURA ─── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: dark ? '#0a0c10' : '#f8fafc',
            opacity: shellFade,
          },
        ]}
      >
        <View style={styles.atmosphereContainer} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              {/* Left Deep Navy Ambient Aura */}
              <RadialGradient id="navyAura" cx="35%" cy="50%" r="45%">
                <Stop offset="0%" stopColor="#1e293b" stopOpacity={dark ? 0.35 : 0.15} />
                <Stop offset="60%" stopColor="#0f172a" stopOpacity={dark ? 0.10 : 0.04} />
                <Stop offset="100%" stopColor={dark ? '#0a0c10' : '#f8fafc'} stopOpacity={0} />
              </RadialGradient>
              {/* Right Radiant Sunset Amber Aura */}
              <RadialGradient id="orangeAura" cx="65%" cy="50%" r="45%">
                <Stop offset="0%" stopColor="#ea580c" stopOpacity={dark ? 0.28 : 0.18} />
                <Stop offset="60%" stopColor="#ea580c" stopOpacity={dark ? 0.08 : 0.05} />
                <Stop offset="100%" stopColor={dark ? '#0a0c10' : '#f8fafc'} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#navyAura)" />
            <Rect width="100%" height="100%" fill="url(#orangeAura)" />
          </Svg>
        </View>
      </Animated.View>

      {/* ─── FLIGHT PARENT CONTAINER (Translate & Scale to Header) ─── */}
      <Animated.View
        style={[
          styles.logoCenterWrap,
          {
            width: logoSize,
            height: logoSize,
            marginLeft: -logoSize / 2,
            marginTop: -logoSize / 2,
            transform: [
              { translateX: flightX },
              { translateY: flightY },
              { scale: flightScale },
            ],
          },
        ]}
      >
        {/* Layer 1: Converging Spheres Assembly */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ scale: spheresScale }],
              opacity: spheresOpacity,
            },
          ]}
        >
          {/* Deep Navy Spheres (Sliding from South-West) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateX: navyTranslateX },
                  { translateY: navyTranslateY },
                ],
              },
            ]}
          >
            <Svg viewBox="0 0 512 512" width={logoSize} height={logoSize}>
              <Defs>
                <RadialGradient id="lux-navy1" cx="35%" cy="35%" r="65%">
                  <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.96" />
                  <Stop offset="70%" stopColor="#0f172a" stopOpacity="0.90" />
                  <Stop offset="100%" stopColor="#090d16" stopOpacity="0.84" />
                </RadialGradient>
                <RadialGradient id="lux-navy2" cx="30%" cy="30%" r="70%">
                  <Stop offset="0%" stopColor="#25334d" stopOpacity="0.94" />
                  <Stop offset="65%" stopColor="#172235" stopOpacity="0.88" />
                  <Stop offset="100%" stopColor="#0b111c" stopOpacity="0.80" />
                </RadialGradient>
              </Defs>
              <Circle cx="208" cy="280" r="165" fill="url(#lux-navy1)" />
              <Circle cx="224" cy="224" r="170" fill="url(#lux-navy2)" />
            </Svg>
          </Animated.View>

          {/* Radiant Sunset Orange Spheres (Sliding from North-East) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateX: orangeTranslateX },
                  { translateY: orangeTranslateY },
                ],
              },
            ]}
          >
            <Svg viewBox="0 0 512 512" width={logoSize} height={logoSize}>
              <Defs>
                <RadialGradient id="lux-orange1" cx="65%" cy="35%" r="65%">
                  <Stop offset="0%" stopColor="#fb923c" stopOpacity="0.94" />
                  <Stop offset="55%" stopColor="#ea580c" stopOpacity="0.88" />
                  <Stop offset="100%" stopColor="#c2410c" stopOpacity="0.80" />
                </RadialGradient>
                <RadialGradient id="lux-orange2" cx="60%" cy="40%" r="65%">
                  <Stop offset="0%" stopColor="#f97316" stopOpacity="0.92" />
                  <Stop offset="60%" stopColor="#d95a1e" stopOpacity="0.86" />
                  <Stop offset="100%" stopColor="#9a3412" stopOpacity="0.78" />
                </RadialGradient>
                <RadialGradient id="lux-orange3" cx="70%" cy="30%" r="70%">
                  <Stop offset="0%" stopColor="#fdba74" stopOpacity="0.88" />
                  <Stop offset="60%" stopColor="#f97316" stopOpacity="0.78" />
                  <Stop offset="100%" stopColor="#c2410c" stopOpacity="0.68" />
                </RadialGradient>
              </Defs>
              <Circle cx="306" cy="222" r="174" fill="url(#lux-orange1)" />
              <Circle cx="324" cy="274" r="166" fill="url(#lux-orange2)" />
              <Circle cx="332" cy="246" r="158" fill="url(#lux-orange3)" />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* Layer 2: Central Convex Smoked Glass Lens (Fuses in Act II) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ scale: lensScale }],
              opacity: lensOpacity,
            },
          ]}
        >
          <Svg viewBox="0 0 512 512" width={logoSize} height={logoSize}>
            <Defs>
              <RadialGradient id="lux-darkGlass" cx="45%" cy="40%" r="62%">
                <Stop offset="0%" stopColor="#45271d" stopOpacity="0.98" />
                <Stop offset="50%" stopColor="#2c1a14" stopOpacity="0.96" />
                <Stop offset="85%" stopColor="#191924" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#10131d" stopOpacity="0.93" />
              </RadialGradient>
              <LinearGradient id="lux-rimSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <Stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
                <Stop offset="75%" stopColor="#ea580c" stopOpacity="0.32" />
                <Stop offset="100%" stopColor="#0f172a" stopOpacity="0.40" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="256"
              cy="256"
              r="168"
              fill="url(#lux-darkGlass)"
              stroke="url(#lux-rimSheen)"
              strokeWidth="1.8"
            />
          </Svg>

          {/* Layer 3: Act III Specular Light Sweep across Glass */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: logoSize / 2,
                overflow: 'hidden',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.sheenBeam,
                {
                  width: logoSize * 0.45,
                  height: logoSize * 1.6,
                  top: -logoSize * 0.3,
                  opacity: sheenOpacity,
                  transform: [
                    { translateX: sheenTranslate },
                    { rotate: '-24deg' },
                  ],
                },
              ]}
            >
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="specularGleam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
                    <Stop offset="40%" stopColor="#ffffff" stopOpacity={0.45} />
                    <Stop offset="50%" stopColor="#ffffff" stopOpacity={0.55} />
                    <Stop offset="60%" stopColor="#ffffff" stopOpacity={0.45} />
                    <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#specularGleam)" />
              </Svg>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Layer 4: Monolithic Typography & Constellation Connector */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateY: typoTranslateY }],
              opacity: typoOpacity,
            },
          ]}
        >
          <Svg viewBox="0 0 512 512" width={logoSize} height={logoSize}>
            {/* LPU Header Text */}
            <SvgText
              x="256"
              y="228"
              textAnchor="middle"
              fontFamily={logoFontFamily}
              fontWeight="900"
              fontSize="106"
              fill="#ffffff"
              letterSpacing="3"
            >
              LPU
            </SvgText>

            {/* Constellation Connector Bar */}
            <Rect
              x="162"
              y="257"
              width="188"
              height="22"
              rx="11"
              fill="rgba(255, 255, 255, 0.16)"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1"
            />
            {/* Left Node */}
            <Circle cx="178" cy="268" r="5.5" fill="#ffffff" />
            {/* Precision Laser Line */}
            <Rect x="184" y="266.4" width="144" height="3.2" rx="1.6" fill="#ffffff" />
            {/* Right Node */}
            <Circle cx="334" cy="268" r="5.5" fill="#ffffff" />

            {/* EVENTS Tracked-out Caps */}
            <SvgText
              x="256"
              y="323"
              textAnchor="middle"
              fontFamily={logoFontFamily}
              fontWeight="800"
              fontSize="33"
              fill="#ffffff"
              letterSpacing="10"
            >
              EVENTS
            </SvgText>
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 10,
  },
  atmosphereContainer: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    bottom: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCenterWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheenBeam: {
    position: 'absolute',
  },
});

export default SplashScreen;
