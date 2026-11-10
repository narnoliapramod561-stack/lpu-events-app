import React, { memo, useId, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect as SvgRect,
  Stop,
} from 'react-native-svg';
import { LpuEventsLogo } from './LpuEventsLogo';
import { NativeIcon } from './NativeIcon';
import { radii, typography } from '../design/tokens';
import { SpecularTopRim } from './ui/NativeGlass';
import { CampusBackground } from './CampusBackground';
import type { EventFeedItem } from '../api/types';

export interface HomeHeaderProps {
  style?: StyleProp<ViewStyle>;
  blurTarget?: React.RefObject<React.ElementRef<typeof View> | null>;
  dark: boolean;
  onToggleTheme: () => void;
  onSearch: (query: string) => void;
  onSelectCategories?: () => void;
  onSelectTrending?: () => void;
  onSelectEvent?: (id: string, name?: string) => void;
  allEvents?: EventFeedItem[];
  onRefresh?: () => void;
  isTrendingActive?: boolean;
  isCategoriesActive?: boolean;
  hideBrandLogo?: boolean;
}


/**
 * Translucent Glass Gradient for Top Half-Screen Mobile Drawer
 * Matches .glass-menu-overlay in student website:
 * Light: linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0.54) 100%)
 * Dark:  linear-gradient(180deg, rgba(24,24,28,0.85) 0%, rgba(18,18,22,0.78) 100%)
 */
function MenuGlassBackground({ dark }: { dark: boolean }) {
  const rawId = useId();
  const gradId = `menu-grad-${dark ? 'dark' : 'light'}-${rawId.replace(/:/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            {dark
              ? [
                  <Stop key="md0" offset="0%" stopColor="#18181c" stopOpacity={0.90} />,
                  <Stop key="md1" offset="100%" stopColor="#121216" stopOpacity={0.86} />,
                ]
              : [
                  <Stop key="ml0" offset="0%" stopColor="#ffffff" stopOpacity={0.88} />,
                  <Stop key="ml1" offset="50%" stopColor="#ffffff" stopOpacity={0.84} />,
                  <Stop key="ml2" offset="100%" stopColor="#ffffff" stopOpacity={0.80} />,
                ]}
          </SvgLinearGradient>
        </Defs>
        <SvgRect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
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
  isTrendingActive = false,
  isCategoriesActive = false,
  hideBrandLogo = false,
}: HomeHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const windowDims = useWindowDimensions();
  const screenDims = Dimensions.get('screen');
  const screenHeight = Math.max(windowDims.height, screenDims.height);
  const lastRefreshRef = useRef(0);
  const searchInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const handleBrandClick = () => {
    handleClearSearch();
    setSearchOpen(false);
    setMenuOpen(false);
    const now = Date.now();
    if (now - lastRefreshRef.current > 2500) {
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
      .slice(0, 8);
  }, [allEvents, query]);

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const handleSelectSuggestion = (id: string, name?: string) => {
    setSearchOpen(false);
    setQuery('');
    onSearch('');
    if (onSelectEvent) {
      onSelectEvent(id, name);
    } else {
      router.push({ pathname: '/events/[id]', params: { id } });
    }
  };

  const isSearchActive = searchOpen || query.length > 0;

  return (
    <View
      style={[
        styles.shell,
        dark ? styles.shellDark : styles.shellLight,
        { paddingTop: Math.max(insets.top - 4, 4) },
        style,
      ]}
    >
      {/* Root-aligned background image: ensures scrolled details slip under the topbar without showing through, while perfectly matching the screen background */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
        <View
          style={{
            width: windowDims.width,
            height: screenHeight,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <CampusBackground dark={dark} />
        </View>
      </View>

      {/* Main Bar Content */}
      <View style={styles.barRow}>
        {/* Brand Logo & Title */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to Student Dashboard"
          style={[styles.brand, hideBrandLogo ? { opacity: 0 } : null]}
          onPress={handleBrandClick}
        >
          <LpuEventsLogo size={42} />
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>
              <Text style={{ color: dark ? '#ffffff' : '#0f172a' }}>LPU</Text>
              <Text style={{ color: dark ? '#ff7f24' : '#ea580c' }}> Events</Text>
            </Text>
          </View>
        </Pressable>

        {/* Action Buttons Group (Exact 3 Action Buttons of Student Website Mobile) */}
        <View style={styles.actions}>
          {/* 1. Search Button (toggles expandable dropdown; turns solid orange when active) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search events"
            onPress={() => {
              setSearchOpen((open) => {
                const next = !open;
                if (next) {
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }
                return next;
              });
            }}
            style={[
              styles.iconButton,
              isSearchActive
                ? styles.searchButtonActive
                : dark
                ? styles.iconButtonDark
                : styles.iconButtonLight,
            ]}
          >
            <NativeIcon
              name="search"
              size={18}
              color={isSearchActive ? '#ffffff' : dark ? '#ffffff' : '#0f172a'}
              strokeWidth={2.2}
            />
          </Pressable>

          {/* 2. Theme Toggle Button (indigo Moon in light mode, bright amber Sun in dark mode) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle light and dark mode"
            onPress={onToggleTheme}
            style={[
              styles.iconButton,
              dark ? styles.iconButtonDark : styles.iconButtonLight,
            ]}
          >
            {dark ? (
              <NativeIcon name="sun" size={18} color="#fbbf24" strokeWidth={2.4} />
            ) : (
              <NativeIcon name="moon" size={18} color="#4f46e5" strokeWidth={2.4} />
            )}
          </Pressable>

          {/* 3. Hamburger Menu Button (toggles top half-screen glass drawer; switches between menu and X) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
            style={[
              styles.iconButton,
              dark ? styles.iconButtonDark : styles.iconButtonLight,
            ]}
            onPress={() => setMenuOpen((open) => !open)}
          >
            <NativeIcon
              name={menuOpen ? 'x' : 'menu'}
              size={20}
              color={dark ? '#ffffff' : '#0f172a'}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>
      </View>

      {/* Expandable Mobile Search Bar (Drops directly below header like student website) */}
      {searchOpen ? (
        <View
          style={[
            styles.searchDropdown,
            {
              backgroundColor: dark ? '#2c2c2e' : '#ffffff',
              borderTopColor: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.85)',
            },
          ]}
        >
          <View
            style={[
              styles.searchInputWrap,
              {
                backgroundColor: dark ? '#3a3a3c' : '#f1f5f9',
                borderColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(226, 232, 240, 0.90)',
              },
            ]}
          >
            <NativeIcon name="search" size={16} color={dark ? '#94a3b8' : '#94a3b8'} strokeWidth={2.2} />
            <TextInput
              ref={searchInputRef}
              autoFocus
              value={query}
              onChangeText={(val) => {
                setQuery(val);
                onSearch(val.trim());
              }}
              onSubmitEditing={() => onSearch(query.trim())}
              placeholder="Search events, clubs, venues..."
              placeholderTextColor={dark ? '#64748b' : '#94a3b8'}
              returnKeyType="search"
              style={[styles.searchInput, { color: dark ? '#ffffff' : '#0f172a' }]}
            />
            {query.length > 0 ? (
              <Pressable
                onPress={handleClearSearch}
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(100, 116, 139, 0.18)',
                  },
                ]}
                accessibilityLabel="Clear search"
              >
                <Text style={[styles.clearBtnText, { color: dark ? '#ffffff' : '#475569' }]}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Autocomplete Suggestions Card (Matching SearchAutocompleteComponent) */}
          {suggestions.length > 0 ? (
            <View
              style={[
                styles.autocompleteBox,
                {
                  backgroundColor: dark ? '#2c2c2e' : '#ffffff',
                  borderColor: dark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0',
                },
              ]}
            >
              <View
                style={[
                  styles.autocompleteHeader,
                  {
                    borderBottomColor: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.80)',
                  },
                ]}
              >
                <View style={styles.suggestPulseRow}>
                  <View style={styles.greenPulseDot} />
                  <Text style={[styles.autocompleteHeaderText, { color: dark ? '#ffffff' : '#1e293b' }]}>
                    Suggested Matches
                  </Text>
                  {suggestions.length > 2 ? (
                    <Text style={[styles.foundCountText, { color: dark ? '#64748b' : '#94a3b8' }]}>
                      ({suggestions.length} found • scroll down)
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.relevanceText, { color: dark ? '#94a3b8' : '#64748b' }]}>
                  by relevance
                </Text>
              </View>

              <ScrollView
                style={styles.suggestionScroll}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {suggestions.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectSuggestion(item.id, item.name)}
                    style={({ pressed }) => [
                      styles.suggestionRow,
                      {
                        backgroundColor: pressed
                          ? dark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(241, 245, 249, 0.8)'
                          : 'transparent',
                        borderBottomColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    ]}
                  >
                    <View style={styles.suggestInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.suggestName, { color: dark ? '#ffffff' : '#0f172a' }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.suggestSub, { color: dark ? '#94a3b8' : '#64748b' }]}
                      >
                        {item.categories?.name || 'Event'}
                        {item.organizations?.name ? ` • ${item.organizations.name}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleSelectSuggestion(item.id, item.name)}
                      style={[
                        styles.suggestViewBtn,
                        {
                          backgroundColor: dark ? 'rgba(255, 255, 255, 0.14)' : '#0f172a',
                          borderColor: dark ? 'rgba(255, 255, 255, 0.18)' : '#0f172a',
                        },
                      ]}
                    >
                      <Text style={styles.suggestViewBtnText}>View</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Top Half-Screen Glass Sheet Menu (Matching Student Website Mobile Drawer) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[
              styles.menuSheet,
              {
                paddingTop: insets.top + 16,
                borderColor: dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.75)',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Blur + Gradient Background */}
            <BlurView
              pointerEvents="none"
              intensity={dark ? 75 : 90}
              tint={dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <MenuGlassBackground dark={dark} />
            <SpecularTopRim dark={dark} height={1} />

            {/* Menu Header with Logo, Title, and Close Button */}
            <View
              style={[
                styles.menuTop,
                {
                  borderBottomColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(148, 163, 184, 0.20)',
                },
              ]}
            >
              <View style={styles.menuBrand}>
                <LpuEventsLogo size={36} />
                <View style={styles.brandTextWrap}>
                  <Text style={styles.menuTitle}>
                    <Text style={{ color: dark ? '#ffffff' : '#0f172a' }}>LPU</Text>
                    <Text style={{ color: dark ? '#ff7f24' : '#ea580c' }}> Events</Text>
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={[
                  styles.menuCloseBtn,
                  {
                    backgroundColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
                accessibilityLabel="Close menu"
              >
                <NativeIcon name="x" size={16} color={dark ? '#ffffff' : '#0f172a'} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Menu Links */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
              {/* 1. Home */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  !isTrendingActive && !isCategoriesActive && !query ? styles.menuItemActive : null,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => {
                  setMenuOpen(false);
                  handleBrandClick();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      !isTrendingActive && !isCategoriesActive && !query
                        ? styles.menuIconBoxActive
                        : dark
                        ? styles.menuIconBoxDark
                        : styles.menuIconBoxLight,
                    ]}
                  >
                    <NativeIcon
                      name="home"
                      size={18}
                      color={!isTrendingActive && !isCategoriesActive && !query ? '#ffffff' : '#ea580c'}
                      strokeWidth={2.4}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: !isTrendingActive && !isCategoriesActive && !query
                          ? '#ea580c'
                          : dark
                          ? '#ffffff'
                          : '#0f172a',
                      },
                    ]}
                  >
                    Home
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* 2. Event Categories */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  isCategoriesActive && !isTrendingActive ? styles.menuItemActive : null,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectCategories?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      isCategoriesActive && !isTrendingActive
                        ? styles.menuIconBoxActive
                        : dark
                        ? styles.menuIconBoxDark
                        : styles.menuIconBoxLight,
                    ]}
                  >
                    <NativeIcon
                      name="layout-grid"
                      size={18}
                      color={isCategoriesActive && !isTrendingActive ? '#ffffff' : '#ea580c'}
                      strokeWidth={2.4}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isCategoriesActive && !isTrendingActive
                          ? '#ea580c'
                          : dark
                          ? '#ffffff'
                          : '#0f172a',
                      },
                    ]}
                  >
                    Event Categories
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* 3. Trending Events */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  isTrendingActive ? styles.menuItemActive : null,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectTrending?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      isTrendingActive
                        ? styles.menuIconBoxActive
                        : dark
                        ? styles.menuIconBoxDark
                        : styles.menuIconBoxLight,
                    ]}
                  >
                    <NativeIcon
                      name="flame"
                      size={18}
                      color={isTrendingActive ? '#ffffff' : '#ea580c'}
                      strokeWidth={2.4}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isTrendingActive
                          ? '#ea580c'
                          : dark
                          ? '#ffffff'
                          : '#0f172a',
                      },
                    ]}
                  >
                    Trending Events
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* 4. Student Clubs & Organizations */}
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  setMenuOpen(false);
                  onSelectCategories?.();
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, dark ? styles.menuIconBoxDark : styles.menuIconBoxLight]}>
                    <NativeIcon name="users" size={18} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
                    Student Clubs &amp; Organizations
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* 5. About LPU Events */}
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/about');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, dark ? styles.menuIconBoxDark : styles.menuIconBoxLight]}>
                    <NativeIcon name="info" size={18} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
                    About LPU Events
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* 6. Contact Support */}
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/contact');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, dark ? styles.menuIconBoxDark : styles.menuIconBoxLight]}>
                    <NativeIcon name="mail" size={18} color="#ea580c" strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.menuLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
                    Contact Support
                  </Text>
                </View>
                <NativeIcon name="arrow-right" size={15} color={dark ? '#64748b' : '#94a3b8'} />
              </Pressable>

              {/* Appearance / Theme Toggle Row */}
              <View
                style={[
                  styles.themeToggleRow,
                  {
                    borderTopColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <View style={styles.appearanceLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      dark ? styles.menuIconBoxDark : styles.menuIconBoxLight,
                    ]}
                  >
                    <NativeIcon name="help-circle" size={17} color="#ea580c" strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.appearanceLabel, { color: dark ? '#ffffff' : '#0f172a' }]}>
                    Appearance
                  </Text>
                </View>

                <Pressable
                  onPress={onToggleTheme}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: dark ? 'rgba(255, 255, 255, 0.15)' : '#ffffff',
                      borderColor: dark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(226, 232, 240, 0.90)',
                    },
                  ]}
                >
                  {dark ? (
                    <>
                      <NativeIcon name="sun" size={14} color="#fbbf24" strokeWidth={2.2} />
                      <Text style={[styles.themeBtnText, { color: '#ffffff' }]}>Dark Mode</Text>
                    </>
                  ) : (
                    <>
                      <NativeIcon name="moon" size={14} color="#4f46e5" strokeWidth={2.2} />
                      <Text style={[styles.themeBtnText, { color: '#0f172a' }]}>Light Mode</Text>
                    </>
                  )}
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
    minHeight: 44,
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'relative',
  },
  shellLight: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  shellDark: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  barRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
  },
  iconButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 2,
  },
  searchButtonActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchDropdown: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  searchInputWrap: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13.5,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  autocompleteBox: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  autocompleteHeader: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontFamily: typography.headingFamily,
  },
  foundCountText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  relevanceText: {
    fontSize: 9,
    fontWeight: '700',
  },
  suggestionScroll: {
    maxHeight: 180,
  },
  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontWeight: '600',
    marginTop: 2,
  },
  suggestViewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  suggestViewBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
  },
  menuSheet: {
    width: '100%',
    maxHeight: '54%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },
  menuTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
  },
  menuItemPressed: {
    opacity: 0.85,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  menuIconBoxActive: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  menuIconBoxLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  menuIconBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  menuLabel: {
    fontFamily: typography.headingFamily,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    paddingHorizontal: 6,
  },
  appearanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appearanceLabel: {
    fontFamily: typography.headingFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
});
