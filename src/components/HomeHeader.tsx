import React, { memo, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LpuEventsLogo } from './LpuEventsLogo';
import { NativeIcon } from './NativeIcon';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';
import type { EventFeedItem } from '../api/types';

interface HomeHeaderProps {
  style?: StyleProp<ViewStyle>;
  blurTarget?: React.RefObject<View | null>;
  dark: boolean;
  onToggleTheme: () => void;
  onSearch: (query: string) => void;
  onSelectCategories?: () => void;
  onSelectTrending?: () => void;
  onSelectEvent?: (id: string) => void;
  allEvents?: EventFeedItem[];
}

function HomeHeaderComponent({
  style,
  blurTarget,
  dark,
  onToggleTheme,
  onSearch,
  onSelectCategories,
  onSelectTrending,
  onSelectEvent,
  allEvents = [],
}: HomeHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const palette = dark ? colors.dark : colors.light;

  const suggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 1) return [];
    return allEvents
      .filter((evt) => {
        if (!evt || !evt.name) return false;
        return (
          evt.name.toLowerCase().includes(clean) ||
          evt.categories?.name?.toLowerCase().includes(clean) ||
          evt.organizations?.name?.toLowerCase().includes(clean)
        );
      })
      .slice(0, 5);
  }, [allEvents, query]);

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const handleSelectSuggestion = (id: string) => {
    setSearchOpen(false);
    setQuery('');
    onSearch('');
    if (onSelectEvent) {
      onSelectEvent(id);
    } else {
      router.push({ pathname: '/events/[id]', params: { id } });
    }
  };

  return (
    <View style={[styles.shell, style]}>
      <BlurView
        pointerEvents="none"
        intensity={64}
        tint="default"
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.row}>
        {/* Brand with University Logo */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to LPU Events home"
          style={styles.brand}
          onPress={() => router.replace('/')}
        >
          <LpuEventsLogo size={36} />
          <Text style={[styles.brandText, { color: palette.text }]}>
            <Text style={{ color: palette.text }}>LPU</Text>
            <Text style={styles.brandEvents}> Events</Text>
          </Text>
        </Pressable>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search events"
            onPress={() => setSearchOpen((open) => !open)}
            style={[
              styles.iconButton,
              searchOpen && { backgroundColor: '#ff6b00', borderColor: '#ff6b00' },
            ]}
          >
            <NativeIcon
              name="search"
              size={18}
              color={searchOpen ? '#ffffff' : palette.text}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle light and dark mode"
            onPress={onToggleTheme}
            style={styles.iconButton}
          >
            <NativeIcon name={dark ? 'sun' : 'moon'} size={18} color={palette.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={styles.iconButton}
            onPress={() => setMenuOpen(true)}
          >
            <NativeIcon name="menu" size={19} color={palette.text} />
          </Pressable>
        </View>
      </View>

      {/* Live Search Input & Autocomplete Floating Box */}
      {searchOpen ? (
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchInputWrap,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
                borderColor: palette.outline,
              },
            ]}
          >
            <NativeIcon name="search" size={16} color={palette.mutedText} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={(val) => {
                setQuery(val);
                onSearch(val.trim());
              }}
              onSubmitEditing={() => onSearch(query.trim())}
              placeholder="Search event name, club, or category..."
              placeholderTextColor={palette.mutedText}
              returnKeyType="search"
              style={[styles.search, { color: palette.text }]}
            />
            {query.length > 0 ? (
              <Pressable onPress={handleClearSearch} style={styles.clearBtn}>
                <NativeIcon name="x" size={13} color={palette.mutedText} />
              </Pressable>
            ) : null}
          </View>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 ? (
            <View
              style={[
                styles.autocompleteBox,
                {
                  backgroundColor: dark ? '#222228' : '#ffffff',
                  borderColor: palette.outline,
                },
              ]}
            >
              <View style={styles.autocompleteHeader}>
                <View style={styles.suggestPulseRow}>
                  <View style={styles.greenPulseDot} />
                  <Text style={[styles.autocompleteHeaderText, { color: palette.text }]}>
                    Suggested Matches
                  </Text>
                </View>
                <Text style={styles.relevanceText}>by relevance</Text>
              </View>

              {suggestions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectSuggestion(item.id)}
                  style={[
                    styles.suggestionRow,
                    { borderTopColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                  ]}
                >
                  <View style={styles.suggestInfo}>
                    <Text numberOfLines={1} style={[styles.suggestName, { color: palette.text }]}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.suggestSub}>
                      {item.categories?.name || 'Event'}
                      {item.organizations?.name ? ` • ${item.organizations.name}` : ''}
                    </Text>
                  </View>
                  <View style={styles.suggestViewBtn}>
                    <Text style={styles.suggestViewBtnText}>View</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Slide-out Menu Modal matching website drawer */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: dark ? '#1c1c22' : '#ffffff',
                borderColor: palette.outline,
              },
            ]}
          >
            <View style={styles.menuTop}>
              <View style={styles.menuBrand}>
                <LpuEventsLogo size={32} />
                <Text style={[styles.menuTitle, { color: palette.text }]}>LPU Events</Text>
              </View>
              <Pressable onPress={() => setMenuOpen(false)} style={styles.menuCloseBtn}>
                <NativeIcon name="x" size={16} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
              {/* Home */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.replace('/');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="home" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Home</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Event Categories */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectCategories?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="layout-grid" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Event Categories</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Trending Events */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectTrending?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="flame" size={18} color="#ea580c" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Trending Events</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Student Clubs */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectCategories?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="users" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>
                    Student Clubs & Organizations
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* About LPU Events */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/about');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="info" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>About LPU Events</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Contact Support */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/contact');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="mail" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Contact Support</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Privacy Policy */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/privacy');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="shield-check" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Privacy Policy</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Terms of Service */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/terms');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="briefcase" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Terms of Service</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Organizer Portal */}
              <Pressable
                style={[styles.menuItem, styles.portalItem]}
                onPress={() => {
                  setMenuOpen(false);
                  Linking.openURL('https://www.lpueventsadmin.live/apply').catch(() => {});
                }}
              >
                <View style={styles.menuItemLeft}>
                  <NativeIcon name="external-link" size={18} color="#ff6b00" />
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Organizer Portal</Text>
                </View>
                <View style={styles.applyBadge}>
                  <Text style={styles.applyBadgeText}>APPLY</Text>
                </View>
              </Pressable>

              {/* Theme Toggle in Menu */}
              <View style={styles.themeToggleRow}>
                <Text style={[styles.themeLabel, { color: palette.mutedText }]}>Appearance</Text>
                <Pressable onPress={onToggleTheme} style={styles.themeBtn}>
                  <NativeIcon name={dark ? 'sun' : 'moon'} size={15} color={palette.text} />
                  <Text style={[styles.themeBtnText, { color: palette.text }]}>
                    {dark ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);

const styles = StyleSheet.create({
  shell: {
    minHeight: 64,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
    overflow: 'visible',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.45)',
    ...shadows.glass,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandText: {
    fontFamily: typography.headingFamily,
    fontSize: 20,
    fontWeight: '900',
  },
  brandEvents: {
    color: '#ff7a1a',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  searchSection: {
    marginTop: 6,
    marginBottom: 6,
    position: 'relative',
    zIndex: 100,
  },
  searchInputWrap: {
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search: {
    flex: 1,
    height: 42,
    fontSize: 13,
    padding: 0,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(100,116,139,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autocompleteBox: {
    marginTop: 6,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.glass,
  },
  autocompleteHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.15)',
  },
  suggestPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  autocompleteHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  relevanceText: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  suggestInfo: {
    flex: 1,
    marginRight: 10,
  },
  suggestName: {
    fontSize: 13,
    fontWeight: '800',
  },
  suggestSub: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  suggestViewBtn: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  suggestViewBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.55)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    width: '85%',
    maxWidth: 360,
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderLeftWidth: 1,
    ...shadows.glass,
  },
  menuTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.2)',
  },
  menuBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  menuCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100,116,139,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  portalItem: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148,163,184,0.18)',
    paddingTop: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 13.5,
    fontWeight: '800',
  },
  applyBadge: {
    backgroundColor: 'rgba(255,107,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.3)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  applyBadgeText: {
    color: '#ff6b00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148,163,184,0.2)',
    paddingHorizontal: 10,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
