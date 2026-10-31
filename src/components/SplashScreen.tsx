import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { LpuEventsLogo } from './LpuEventsLogo';

interface SplashScreenProps {
  onFinished: () => void;
}

const ASSEMBLY_DURATION = 560;
const PREMIUM_EASE = Easing.bezier(0.16, 1, 0.3, 1);

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
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
    const reveal = (value: Animated.Value, duration: number) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: PREMIUM_EASE,
        useNativeDriver: true,
      });
    const circleAssembly = Animated.parallel(
      layerProgress.map((value, index) =>
        Animated.sequence([
          Animated.delay(index * 22),
          reveal(value, index === 5 ? 600 : ASSEMBLY_DURATION),
        ]),
      ),
    );

    const startup = Animated.sequence([
      Animated.parallel([
        Animated.timing(entrance, {
          toValue: 1,
          duration: 700,
          easing: PREMIUM_EASE,
          useNativeDriver: true,
        }),
        circleAssembly,
      ]),
      Animated.parallel([
        reveal(lpuOpacity, 360),
      ]),
      Animated.sequence([
        Animated.delay(70),
        reveal(connectorOpacity, 300),
      ]),
      Animated.sequence([
        Animated.delay(60),
        reveal(eventsOpacity, 380),
      ]),
    ]);
    startup.start(() => {
      if (!active) return;
      const targetX = -(width / 2 - 16 - 21);
      const targetY = -(height / 2 - 8 - 21);
      Animated.parallel([
        Animated.timing(handoffX, {
          toValue: targetX,
          duration: 620,
          easing: PREMIUM_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffY, {
          toValue: targetY,
          duration: 620,
          easing: PREMIUM_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffScale, {
          toValue: 42 / logoSize,
          duration: 620,
          easing: PREMIUM_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(handoffFade, {
          toValue: 0,
          duration: 280,
          delay: 340,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (active) onFinished();
      });
    });

    return () => {
      active = false;
      startup.stop();
    };
  }, [connectorOpacity, entrance, eventsOpacity, handoffFade, handoffScale, handoffX, handoffY, height, layerProgress, logoSize, lpuOpacity, onFinished, width]);

  const logoScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const logoOpacity = entrance;
  const layerOpacities = layerProgress.map((progress, index) =>
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, index === 5 ? 0.96 : 1],
    }),
  );

  return (
    <Animated.View style={styles.shell}>
      <Animated.View style={[styles.backdrop, { opacity: handoffFade }]} />
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
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 248, 245, 0.96)',
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    overflow: 'hidden',
    borderRadius: 999,
  },
});

export default SplashScreen;
