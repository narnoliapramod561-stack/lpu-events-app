import React, { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect as SvgRect,
  Stop,
} from 'react-native-svg';
import { LpuEventsLogo } from './LpuEventsLogo';
import { typography } from '../design/tokens';
import { SpecularTopRim } from './ui/NativeGlass';

export interface NativeFooterProps {
  dark: boolean;
  onSelectCategories?: () => void;
}

/**
 * Specular Real Glass Linear Gradient Overlay for Footer
 * Matches .glass-panel in student website
 */
function FooterGlassBackground({ dark }: { dark: boolean }) {
  const rawId = useId();
  const gradId = `footer-grad-${dark ? 'dark' : 'light'}-${rawId.replace(/:/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            {dark
              ? [
                  <Stop key="d0" offset="0%" stopColor="#18181c" stopOpacity={0.90} />,
                  <Stop key="d1" offset="100%" stopColor="#121216" stopOpacity={0.85} />,
                ]
              : [
                  <Stop key="l0" offset="0%" stopColor="#ffffff" stopOpacity={0.88} />,
                  <Stop key="l1" offset="100%" stopColor="#ffffff" stopOpacity={0.82} />,
                ]}
          </SvgLinearGradient>
        </Defs>
        <SvgRect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

export function NativeFooter({ dark, onSelectCategories }: NativeFooterProps) {
  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.95)',
          shadowColor: dark ? '#000000' : '#0f172a',
        },
      ]}
    >
      {/* Real Glass Blur View */}
      <BlurView
        pointerEvents="none"
        intensity={dark ? 75 : 90}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* Real Glass Gradient Overlay */}
      <FooterGlassBackground dark={dark} />

      {/* Specular Top Rim */}
      <SpecularTopRim dark={dark} height={1} />

      <View style={styles.container}>
        {/* Brand Header */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to home"
          style={styles.brandRow}
          onPress={() => router.replace('/')}
        >
          <LpuEventsLogo size={42} />
          <Text style={styles.brandTitle}>
            <Text style={{ color: dark ? '#ffffff' : '#0f172a' }}>LPU</Text>
            <Text style={{ color: dark ? '#ff7f24' : '#ea580c' }}> Events</Text>
          </Text>
        </Pressable>

        {/* Mission Statement matching student website exactly */}
        <Text style={[styles.description, { color: dark ? '#cbd5e1' : '#475569' }]}>
          Your central hub for discovering and participating in the vibrant campus life at Lovely Professional University. Fully compliant with Google AdSense Programme Policies.
        </Text>

        {/* Two-Column Grid: Explore & Legal/Privacy (Exact layout of mobile website) */}
        <View style={styles.navGrid}>
          {/* Column 1: Explore */}
          <View style={styles.navCol}>
            <Text style={[styles.colHeader, { color: dark ? '#ffffff' : '#0f172a' }]}>
              EXPLORE
            </Text>
            <View style={styles.linkList}>
              <Pressable
                onPress={() => router.push('/about')}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkPressed]}
              >
                <Text style={[styles.linkText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  About Us
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onSelectCategories?.()}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkPressed]}
              >
                <Text style={[styles.linkText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  Categories
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/contact')}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkPressed]}
              >
                <Text style={[styles.linkText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  Contact Us
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Column 2: Legal & Privacy */}
          <View style={styles.navCol}>
            <Text style={[styles.colHeader, { color: dark ? '#ffffff' : '#0f172a' }]}>
              LEGAL & PRIVACY
            </Text>
            <View style={styles.linkList}>
              <Pressable
                onPress={() => router.push('/privacy')}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkPressed]}
              >
                <Text style={[styles.linkText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  Privacy Policy
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/terms')}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkPressed]}
              >
                <Text style={[styles.linkText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  Terms of Service
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Mobile Copyright: Placed cleanly at bottom with divider */}
        <View
          style={[
            styles.copyrightDivider,
            { borderTopColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          <Text style={[styles.copyrightText, { color: dark ? '#94a3b8' : '#64748b' }]}>
            © 2026 LPU Events. All rights reserved. • Lovely Professional University
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    marginTop: 40,
    borderTopWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  brandTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 24,
    maxWidth: 420,
  },
  navGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  navCol: {
    flex: 1,
  },
  colHeader: {
    fontFamily: typography.headingFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  linkList: {
    gap: 2,
  },
  linkItem: {
    minHeight: 34,
    justifyContent: 'center',
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  copyrightDivider: {
    borderTopWidth: 1,
    paddingTop: 14,
  },
  copyrightText: {
    fontFamily: typography.headingFamily,
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
  },
});
