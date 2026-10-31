import React, { memo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LpuEventsLogo } from './LpuEventsLogo';
import { NativeIcon } from './NativeIcon';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';

interface HomeHeaderProps {
  dark: boolean;
  onToggleTheme: () => void;
  onSearch: (query: string) => void;
  onSelectCategories?: () => void;
}

function HomeHeaderComponent({ dark, onToggleTheme, onSearch, onSelectCategories }: HomeHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const palette = dark ? colors.dark : colors.light;

  return (
    <View style={styles.shell}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={dark ? '#172554' : '#0e7490'} />
            <Stop offset="55%" stopColor={dark ? '#164e63' : '#0891b2'} />
            <Stop offset="100%" stopColor={dark ? '#312e81' : '#2563eb'} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#headerGradient)" />
      </Svg>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go to LPU Events home" style={styles.brand} onPress={() => router.replace('/')}>
          <LpuEventsLogo size={42} />
          <Text style={styles.brandText}><Text style={styles.brandLpu}>LPU</Text><Text style={styles.brandEvents}> Events</Text></Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search events"
            onPress={() => setSearchOpen((open) => !open)}
            style={styles.iconButton}
          >
            <NativeIcon name="search" size={21} color="#ffffff" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle light and dark mode"
            onPress={onToggleTheme}
            style={styles.iconButton}
          >
            <NativeIcon name={dark ? 'sun' : 'moon'} size={20} color="#ffffff" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Open menu" style={styles.iconButton} onPress={() => setMenuOpen(true)}>
            <NativeIcon name="menu" size={21} color="#ffffff" />
          </Pressable>
        </View>
      </View>
      {searchOpen ? (
        <TextInput
          autoFocus
          value={query}
          onChangeText={(value) => { setQuery(value); onSearch(value.trim()); }}
          onSubmitEditing={() => onSearch(query.trim())}
          placeholder="Search event name..."
          placeholderTextColor={palette.mutedText}
          returnKeyType="search"
          style={[styles.search, { color: palette.text, backgroundColor: palette.surface3, borderColor: palette.outline }]}
        />
      ) : null}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { backgroundColor: palette.surface }]}>
            <Text style={[styles.menuTitle, { color: palette.text }]}>LPU Events</Text>
            {[
              ['/', 'Events'],
              ['#categories', 'Event Categories'],
              ['/about', 'About Us'],
              ['/contact', 'Contact Us'],
              ['/privacy', 'Privacy Policy'],
              ['/terms', 'Terms of Service'],
            ].map(([path, label]) => (
              <Pressable key={path} style={styles.menuItem} onPress={() => { setMenuOpen(false); if (path === '#categories') onSelectCategories?.(); else router.push(path as '/' | '/about' | '/contact' | '/privacy' | '/terms'); }}>
                <Text style={[styles.menuLabel, { color: palette.text }]}>{label}</Text>
                <NativeIcon name="arrow-right" size={16} color={palette.mutedText} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);

const styles = StyleSheet.create({
  shell: {
    minHeight: 76,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
    ...shadows.glass,
  },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandText: { fontFamily: typography.headingFamily, fontSize: 22, fontWeight: '900' },
  brandLpu: { color: '#ffffff' },
  brandEvents: { color: '#ff7a1a' },
  actions: { flexDirection: 'row', gap: spacing.xs },
  iconButton: { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)' },
  icon: { fontSize: 23, lineHeight: 25, fontWeight: '700', color: '#ffffff' },
  search: { height: 42, borderRadius: radii.sm, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, fontSize: typography.sizes.body },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.48)', alignItems: 'flex-end' },
  menu: { width: '82%', maxWidth: 360, marginTop: 54, marginRight: spacing.md, borderRadius: radii.lg, padding: spacing.md, ...shadows.glass },
  menuTitle: { fontFamily: typography.headingFamily, fontSize: 20, fontWeight: '900', marginBottom: spacing.sm },
  menuItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(148,163,184,0.25)' },
  menuLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: '700' },
});
