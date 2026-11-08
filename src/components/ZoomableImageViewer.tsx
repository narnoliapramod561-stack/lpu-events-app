import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { radii, shadows, spacing, typography } from '../design/tokens';
import { NativeIcon } from './NativeIcon';

export interface ZoomableImageViewerProps {
  visible: boolean;
  onClose: () => void;
  image: ImageSourcePropType | null | undefined;
  title?: string;
  dark?: boolean;
}

export function ZoomableImageViewer({
  visible,
  onClose,
  image,
  title = 'Event Image',
  dark = true,
}: ZoomableImageViewerProps) {
  const windowDims = Dimensions.get('window');
  const screenWidth = windowDims.width;
  const screenHeight = windowDims.height;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentScaleRef = useRef(1);
  const currentPanRef = useRef({ x: 0, y: 0 });
  const [zoomPercent, setZoomPercent] = useState(100);

  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(1);
  const initialPan = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // Sync listener values to refs for low-overhead gesture calculations
  useEffect(() => {
    const scaleSub = scaleAnim.addListener(({ value }) => {
      currentScaleRef.current = value;
      const rounded = Math.round(value * 100);
      setZoomPercent(rounded);
    });
    const panSub = panAnim.addListener((val) => {
      currentPanRef.current = val;
    });
    return () => {
      scaleAnim.removeListener(scaleSub);
      panAnim.removeListener(panSub);
    };
  }, [scaleAnim, panAnim]);

  // Reset transforms whenever modal opens or closes
  const resetZoom = useCallback((animated = true) => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }),
        Animated.spring(panAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      panAnim.setValue({ x: 0, y: 0 });
    }
  }, [scaleAnim, panAnim]);

  useEffect(() => {
    if (!visible) {
      resetZoom(false);
    }
  }, [visible, resetZoom]);

  const zoomTo = useCallback((targetScale: number) => {
    const clamped = Math.max(1, Math.min(4, targetScale));
    if (clamped === 1) {
      resetZoom(true);
    } else {
      Animated.spring(scaleAnim, {
        toValue: clamped,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start();
    }
  }, [scaleAnim, resetZoom]);

  const zoomIn = () => {
    zoomTo(currentScaleRef.current + 0.6);
  };

  const zoomOut = () => {
    zoomTo(currentScaleRef.current - 0.6);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx !== 0 || gestureState.dy !== 0 || Math.abs(gestureState.vx) > 0;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const t0 = touches[0];
          const t1 = touches[1];
          initialDistance.current = Math.hypot(t1.pageX - t0.pageX, t1.pageY - t0.pageY);
          initialScale.current = currentScaleRef.current;
        } else if (touches.length === 1) {
          const now = Date.now();
          if (now - lastTapRef.current < 280) {
            // Double-tap detected: toggle zoom between 1x and 2.5x
            lastTapRef.current = 0;
            if (currentScaleRef.current > 1.2) {
              resetZoom(true);
            } else {
              zoomTo(2.5);
            }
          } else {
            lastTapRef.current = now;
          }
          initialPan.current = { x: currentPanRef.current.x, y: currentPanRef.current.y };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2 && initialDistance.current) {
          // Pinch to zoom
          const t0 = touches[0];
          const t1 = touches[1];
          const currentDist = Math.hypot(t1.pageX - t0.pageX, t1.pageY - t0.pageY);
          const ratio = currentDist / initialDistance.current;
          const nextScale = Math.max(0.85, Math.min(4.5, initialScale.current * ratio));
          scaleAnim.setValue(nextScale);
        } else if (touches.length === 1 && currentScaleRef.current > 1.05) {
          // Pan while zoomed in
          const nextX = initialPan.current.x + gestureState.dx;
          const nextY = initialPan.current.y + gestureState.dy;
          const maxPanX = ((currentScaleRef.current - 1) * screenWidth) / 2;
          const maxPanY = ((currentScaleRef.current - 1) * screenHeight) / 2;
          panAnim.setValue({
            x: Math.max(-maxPanX * 1.3, Math.min(maxPanX * 1.3, nextX)),
            y: Math.max(-maxPanY * 1.3, Math.min(maxPanY * 1.3, nextY)),
          });
        }
      },
      onPanResponderRelease: () => {
        initialDistance.current = null;
        if (currentScaleRef.current < 1) {
          resetZoom(true);
        } else if (currentScaleRef.current > 4) {
          Animated.spring(scaleAnim, {
            toValue: 4,
            useNativeDriver: true,
            friction: 7,
          }).start();
        } else if (currentScaleRef.current > 1.05) {
          // Soft clamp pan bounds
          const maxPanX = ((currentScaleRef.current - 1) * screenWidth) / 2;
          const maxPanY = ((currentScaleRef.current - 1) * screenHeight) / 2;
          const clampedX = Math.max(-maxPanX, Math.min(maxPanX, currentPanRef.current.x));
          const clampedY = Math.max(-maxPanY, Math.min(maxPanY, currentPanRef.current.y));
          if (clampedX !== currentPanRef.current.x || clampedY !== currentPanRef.current.y) {
            Animated.spring(panAnim, {
              toValue: { x: clampedX, y: clampedY },
              useNativeDriver: true,
              friction: 7,
            }).start();
          }
        }
      },
    })
  ).current;

  if (!image) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Hardware Ambient Blur Backdrop */}
        <BlurView
          intensity={Platform.OS === 'android' ? 60 : 85}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (currentScaleRef.current > 1.2) {
              resetZoom(true);
            } else {
              onClose();
            }
          }}
          accessibilityLabel="Dismiss image viewer"
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(4, 4, 7, 0.92)' }]} />
        </Pressable>

        {/* Top Header Bar */}
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
            <Text style={styles.subtitleText}>Pinch or double-tap to zoom</Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Close image"
          >
            <NativeIcon name="x" size={18} color="#ffffff" strokeWidth={2.4} />
          </Pressable>
        </SafeAreaView>

        {/* Centered Zoomable & Pannable Image Canvas */}
        <View style={styles.canvasContainer} pointerEvents="box-none">
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.imageTransformWrapper,
              {
                transform: [
                  { translateX: panAnim.x },
                  { translateY: panAnim.y },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Image
              source={image}
              resizeMode="contain"
              style={styles.fullImage}
            />
          </Animated.View>
        </View>

        {/* Floating Zoom Controls Dock & Bottom Actions */}
        <SafeAreaView edges={['bottom']} style={styles.bottomDock} pointerEvents="box-none">
          {/* Zoom Control Pill (-, %, +, Reset) */}
          <View style={styles.zoomControlPill}>
            <Pressable
              onPress={zoomOut}
              disabled={zoomPercent <= 100}
              style={({ pressed }) => [
                styles.zoomBtn,
                zoomPercent <= 100 && styles.zoomBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
            >
              <NativeIcon
                name="minus"
                size={16}
                color={zoomPercent <= 100 ? 'rgba(255,255,255,0.35)' : '#ffffff'}
                strokeWidth={2.6}
              />
            </Pressable>

            <Pressable
              onPress={() => resetZoom(true)}
              style={({ pressed }) => [styles.zoomPercentBadge, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Current zoom ${zoomPercent} percent. Tap to reset.`}
            >
              <Text style={styles.zoomPercentText}>{zoomPercent}%</Text>
            </Pressable>

            <Pressable
              onPress={zoomIn}
              disabled={zoomPercent >= 400}
              style={({ pressed }) => [
                styles.zoomBtn,
                zoomPercent >= 400 && styles.zoomBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
            >
              <NativeIcon
                name="plus"
                size={16}
                color={zoomPercent >= 400 ? 'rgba(255,255,255,0.35)' : '#ffffff'}
                strokeWidth={2.6}
              />
            </Pressable>

            {zoomPercent > 100 && (
              <Pressable
                onPress={() => resetZoom(true)}
                style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Reset zoom to 100%"
              >
                <NativeIcon name="refresh" size={13} color="#ea580c" strokeWidth={2.6} />
                <Text style={styles.resetBtnText}>Reset</Text>
              </Pressable>
            )}
          </View>

          {/* Close Pill */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.bottomClosePill, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Close viewer"
          >
            <NativeIcon name="x" size={13} color="#ffffff" strokeWidth={2.6} />
            <Text style={styles.bottomClosePillText}>Close</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleWrap: {
    flex: 1,
    marginRight: 16,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: typography.headingFamily,
    marginTop: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  canvasContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageTransformWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
    overflow: 'visible',
  },
  fullImage: {
    width: Dimensions.get('window').width - 24,
    height: Dimensions.get('window').height * 0.72,
    borderRadius: radii.xl,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 30,
  },
  zoomControlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 22, 28, 0.90)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...shadows.glass,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnDisabled: {
    opacity: 0.4,
  },
  zoomPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  zoomPercentText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(234, 88, 12, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.35)',
  },
  resetBtnText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  bottomClosePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  bottomClosePillText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    letterSpacing: 0.3,
  },
});
