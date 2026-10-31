import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '../design/tokens';
import { openMailtoUrl } from '../utils/externalLinks';

export function NativeFooter({ dark, onSelectCategories }: { dark: boolean; onSelectCategories?: () => void }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View style={[styles.footer, { backgroundColor: palette.surface, borderColor: palette.outline }]}>
      <Text style={[styles.brand, { color: palette.text }]}>LPU Events</Text>
      <Text style={[styles.copy, { color: palette.mutedText }]}>Your central hub for discovering and participating in campus life at Lovely Professional University.</Text>
      <View style={styles.links}>
        <Pressable onPress={() => onSelectCategories?.()}>
          <Text style={[styles.link, { color: palette.primary }]}>Categories</Text>
        </Pressable>
        {[
          ['/about', 'About Us'],
          ['/contact', 'Contact Us'],
          ['/privacy', 'Privacy'],
          ['/terms', 'Terms'],
        ].map(([path, label]) => (
          <Pressable key={path} onPress={() => router.push(path as '/' | '/about' | '/contact' | '/privacy' | '/terms')}>
            <Text style={[styles.link, { color: palette.primary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => void openMailtoUrl('contact@lpuevents.live', 'LPU Events inquiry')}>
        <Text style={[styles.email, { color: palette.mutedText }]}>contact@lpuevents.live</Text>
      </Pressable>
      <Text style={[styles.copy, { color: palette.mutedText }]}>© 2026 LPU Events • Lovely Professional University, Punjab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: spacing.xl, padding: spacing.lg, borderTopWidth: 1 },
  brand: { fontFamily: typography.headingFamily, fontSize: 20, fontWeight: '900' },
  copy: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, marginTop: spacing.sm },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginVertical: spacing.md },
  link: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: '800' },
  email: { fontSize: 12, marginBottom: spacing.md },
});
