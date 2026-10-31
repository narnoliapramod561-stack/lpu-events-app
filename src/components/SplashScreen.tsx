import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { LpuEventsLogo } from './LpuEventsLogo';
import { colors, shadows } from '../design/tokens';

interface SplashScreenProps {
  onFinished: () => void;
}

const ASSEMBLY_DURATION = 460;
const SHEEN_DELAY = 220;
const SHEEN_DURATION = 550;

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const logoSize = Math.min(320, Math.max(220, Math.min(width * 0.78, height * 0.44)));
  const entrance = useRef(new Animated.Value(0)).current;
  const layerProgress = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const handoff = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const layers = layerProgress.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: index === 5 ? 500 : ASSEMBLY_DURATION,
        delay: index * 30,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }),
    );

    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 650,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }),
      ...layers,
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 380,
        delay: 160,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }),
      Animated.timing(sheen, {
        toValue: 1,
        duration: SHEEN_DURATION,
        delay: SHEEN_DELAY,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(handoff, {
        toValue: 0,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(onFinished);
    });
  }, [entrance, handoff, layerProgress, onFinished, sheen, textOpacity]);

  const logoScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const logoOpacity = entrance;
  const sheenTranslate = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoSize * 1.4, logoSize * 2.2],
  });
  const layerOpacities = layerProgress.map((progress, index) =>
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, index === 5 ? 0.96 : 1],
    }),
  );

  return (
    <Animated.View style={[styles.shell, { opacity: handoff }]}>
      <View style={styles.backdrop} />
      <Animated.View
        style={[
          styles.logoContainer,
          { width: logoSize, height: logoSize, marginLeft: -logoSize / 2, marginTop: -logoSize / 2 },
          shadows.orange,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <LpuEventsLogo
          size={logoSize}
          animatedOpacities={layerOpacities}
          textOpacity={textOpacity}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sheen,
            { width: logoSize * 0.4, height: logoSize, transform: [{ translateX: sheenTranslate }, { skewX: '-14deg' }] },
          ]}
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
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    opacity: 0.45,
  },
});

export default SplashScreen;
