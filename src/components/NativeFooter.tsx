import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LpuEventsLogo } from './LpuEventsLogo';
import { colors, glass, radii, shadows, spacing, typography } from '../design/tokens';
import { openMailtoUrl } from '../utils/externalLinks';
import { SpecularTopRim } from './ui/NativeGlass';

interface NativeFooterProps {
  dark: boolean;
  onSelectCategories?: () => void;
}

export function NativeFooter({ dark, onSelectCategories }: NativeFooterProps) {
  const palette = dark ? colors.dark : colors.light;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: dark ? glass.dark.headerBg : glass.light.headerBg,
          borderTopColor: dark ? glass.dark.border : glass.light.border,
          borderTopWidth: 1.5,
        },
      ]}
    >
      <SpecularTopRim dark={dark} height={1.5} />
      {/* Brand & Description */}
      <View style={styles.brandRow}>
        <LpuEventsLogo size={38} />
        <Text style={[styles.brand, { color: palette.text }]}>
          <Text style={{ color: palette.text }}>LPU </Text>
          <Text style={{ color: '#ff7a1a' }}>Events</Text>
        </Text>
      </View>

      <Text style={[styles.copy, { color: dark ? '#cbd5e1' : '#475569' }]}>
        Your central hub for discovering and participating in the vibrant campus life at Lovely
        Professional University.
      </Text>

      {/* Explore Section */}
      <View style={styles.sectionDivider} />

      <View style={styles.linkGroup}>
        <Text style={[styles.groupTitle, { color: dark ? '#ffffff' : '#0f172a' }]}>
          EXPLORE
        </Text>
        <View style={styles.linksRow}>
          <Pressable onPress={() => onSelectCategories?.()} style={styles.linkButton}>
            <Text style={[styles.link, { color: '#ff6b00' }]}>Categories</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/about')} style={styles.linkButton}>
            <Text style={[styles.link, { color: '#ff6b00' }]}>About Us</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/contact')} style={styles.linkButton}>
            <Text style={[styles.link, { color: '#ff6b00' }]}>Contact Us</Text>
          </Pressable>
        </View>
      </View>

      {/* Legal & Privacy Section */}
      <View style={styles.linkGroup}>
        <Text style={[styles.groupTitle, { color: dark ? '#ffffff' : '#0f172a' }]}>
          LEGAL & PRIVACY
        </Text>
        <View style={styles.linksRow}>
          <Pressable onPress={() => router.push('/privacy')} style={styles.linkButton}>
            <Text style={[styles.link, { color: '#ff6b00' }]}>Privacy Policy</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/terms')} style={styles.linkButton}>
            <Text style={[styles.link, { color: '#ff6b00' }]}>Terms of Service</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* Email & Copyright */}
      <Pressable
        onPress={() => void openMailtoUrl('contact@lpuevents.live', 'LPU Events inquiry')}
        style={styles.emailRow}
      >
        <Text style={[styles.email, { color: dark ? '#94a3b8' : '#64748b' }]}>
          contact@lpuevents.live
        </Text>
      </Pressable>

      <Text style={[styles.copyright, { color: dark ? '#94a3b8' : '#94a3b8' }]}>
        © 2026 LPU Events • Lovely Professional University, Punjab
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.gutter,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    gap: 12,
    ...shadows.glass,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    fontFamily: typography.headingFamily,
    fontSize: 21,
    fontWeight: '900',
  },
  copy: {
    fontFamily: typography.fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.18)',
    marginVertical: 4,
  },
  linkGroup: {
    gap: 6,
  },
  groupTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  linkButton: {
    paddingVertical: 3,
  },
  link: {
    fontSize: 13,
    fontWeight: '800',
  },
  emailRow: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
});
