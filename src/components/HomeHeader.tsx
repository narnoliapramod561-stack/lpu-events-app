import React, { memo, useMemo, useRef, useState } from 'react';
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
import { colors, glass, radii, shadows, spacing, typography } from '../design/tokens';
import { SpecularTopRim } from './ui/NativeGlass';
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
  onRefresh?: () => void;
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
  onRefresh,
}: HomeHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const palette = dark ? colors.dark : colors.light;
  const lastRefreshRef = useRef(0);

  const handleBrandClick = () => {
    const now = Date.now();
    if (now - lastRefreshRef.current > 3000) {
      lastRefreshRef.current = now;
      onRefresh?.();
    }
    router.replace('/');
  };

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
    <View
      style={[
        styles.shell,
        {
          backgroundColor: 'transparent',
          borderBottomColor: dark ? glass.dark.border : glass.light.border,
          borderBottomWidth: 1.5,
        },
        style,
      ]}
    >
      <BlurView
        pointerEvents="none"
        intensity={dark ? 70 : 85}
        tint={dark ? 'dark' : 'light'}
        blurMethod={blurTarget?.current ? 'dimezisBlurViewSdk31Plus' : 'none'}
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      {/* Translucent Frosted Tint Overlay — sits on top of BlurView for optimal contrast */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: dark ? glass.dark.headerBg : glass.light.headerBg,
          },
        ]}
      />
      <SpecularTopRim dark={dark} height={1.5} />
      <View style={styles.row}>
        {/* Brand with University Logo */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to LPU Events home"
          style={styles.brand}
          onPress={handleBrandClick}
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
              {
                backgroundColor: searchOpen
                  ? '#ff6b00'
                  : dark
                  ? glass.dark.pillBg
                  : glass.light.pillBg,
                borderColor: searchOpen
                  ? '#ff6b00'
                  : dark
                  ? glass.dark.pillBorder
                  : glass.light.pillBorder,
              },
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
            style={[
              styles.iconButton,
              {
                backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
                borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
              },
            ]}
          >
            <NativeIcon name={dark ? 'sun' : 'moon'} size={18} color={palette.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={[
              styles.iconButton,
              {
                backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
                borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
              },
            ]}
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
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
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
                  backgroundColor: 'transparent',
                  borderColor: dark ? glass.dark.border : glass.light.border,
                  borderWidth: 1.5,
                },
              ]}
            >
              <BlurView
                pointerEvents="none"
                intensity={dark ? 65 : 85}
                tint={dark ? 'dark' : 'light'}
                blurMethod={blurTarget?.current ? 'dimezisBlurViewSdk31Plus' : 'none'}
                blurTarget={blurTarget}
                style={StyleSheet.absoluteFill}
              />
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: dark ? glass.dark.panelBg : glass.light.panelBg },
                ]}
              />
              <SpecularTopRim dark={dark} height={1.2} />
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

      {/* Top Half-Screen Glass Sheet Menu matching website drawer */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[
              styles.menu,
              {
                backgroundColor: 'transparent',
                borderColor: dark ? glass.dark.border : glass.light.border,
                borderBottomWidth: 1.5,
                overflow: 'hidden',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView
              pointerEvents="none"
              intensity={dark ? 75 : 90}
              tint={dark ? 'dark' : 'light'}
              blurMethod="none"
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: dark ? glass.dark.panelBg : glass.light.panelBg },
              ]}
            />
            <SpecularTopRim dark={dark} height={1.5} />
            <View style={styles.menuTop}>
              <View style={styles.menuBrand}>
                <LpuEventsLogo size={32} />
                <Text style={[styles.menuTitle, { color: palette.text }]}>LPU Events</Text>
              </View>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={[
                  styles.menuCloseBtn,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
                accessibilityLabel="Close menu"
              >
                <NativeIcon name="x" size={15} color={palette.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
              {/* Home */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  handleBrandClick();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="home" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="layout-grid" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="flame" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="users" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: palette.text }]}>
                    Student Clubs &amp; Organizations
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="info" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="mail" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Contact Support</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Club & Event Listing Inquiry (matching student website) */}
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/contact');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="sparkles" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: palette.text }]}>
                    Club &amp; Event Listing Inquiry
                  </Text>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="shield-check" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
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
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(234,88,12,0.22)' : 'rgba(234,88,12,0.12)',
                        borderColor: 'rgba(234,88,12,0.25)',
                      },
                    ]}
                  >
                    <NativeIcon name="briefcase" size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: palette.text }]}>Terms of Service</Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={palette.mutedText} />
              </Pressable>

              {/* Theme Toggle in Menu */}
              <View
                style={[
                  styles.themeToggleRow,
                  {
                    borderTopColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.appearanceLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      {
                        backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)',
                        borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <NativeIcon name={dark ? 'moon' : 'sun'} size={17} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.themeLabel, { color: palette.text }]}>Appearance</Text>
                </View>

                <Pressable
                  onPress={onToggleTheme}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)',
                      borderColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)',
                    },
                  ]}
                >
                  <NativeIcon name={dark ? 'sun' : 'moon'} size={14} color={dark ? '#f59e0b' : '#6366f1'} />
                  <Text style={[styles.themeBtnText, { color: palette.text }]}>
                    {dark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
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
    backgroundColor: 'rgba(2,6,23,0.45)',
    justifyContent: 'flex-start',
  },
  menu: {
    width: '100%',
    maxHeight: '56%',
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1.5,
    ...shadows.glass,
  },
  menuTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
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
    fontSize: 17,
    fontWeight: '900',
  },
  menuCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    gap: 2,
  },
  menuItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: typography.headingFamily,
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
  },
  appearanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeLabel: {
    fontFamily: typography.headingFamily,
    fontSize: 13.5,
    fontWeight: '900',
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
});
