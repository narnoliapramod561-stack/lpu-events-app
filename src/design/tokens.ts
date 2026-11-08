import { Platform } from 'react-native';

export const colors = {
  light: {
    background: '#f4f7fb',
    surface: 'rgba(255, 255, 255, 0.72)',
    surface2: 'rgba(255, 255, 255, 0.52)',
    surface3: 'rgba(255, 255, 255, 0.82)',
    outline: 'rgba(255, 255, 255, 0.85)',
    primary: '#ff6b00',
    primaryDim: '#d95a00',
    primarySubtle: 'rgba(255, 107, 0, 0.12)',
    text: '#0f172a',
    mutedText: '#64748b',
    variantText: '#334155',
    onPrimary: '#ffffff',
  },
  dark: {
    background: '#1c1c1e',
    surface: 'rgba(44, 44, 46, 0.78)',
    surface2: 'rgba(58, 58, 60, 0.72)',
    surface3: 'rgba(72, 72, 74, 0.65)',
    outline: 'rgba(255, 255, 255, 0.10)',
    primary: '#ffffff',
    primaryDim: '#e5e5ea',
    primarySubtle: 'rgba(255, 255, 255, 0.10)',
    text: '#f5f5f7',
    mutedText: '#aeaeb2',
    variantText: '#8e8e93',
    onPrimary: '#1c1c1e',
  },
} as const;

export const spacing = {
  gutter: 16,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 9999,
} as const;

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  headingFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  cormorantItalic: Platform.select({
    ios: 'CormorantGaramond-BoldItalic',
    android: 'CormorantGaramond-BoldItalic',
    default: 'CormorantGaramond-BoldItalic',
  }),
  sizes: {
    caption: 12,
    body: 14,
    bodyLarge: 16,
    title: 20,
    display: 26,
  },
  weights: {
    regular: '400',
    semibold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },
} as const;

export const shadows = {
  orange: {
    shadowColor: '#e65100',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
} as const;

export const glass = {
  light: {
    panelBg: 'rgba(255, 255, 255, 0.54)',
    cardBg: 'rgba(255, 255, 255, 0.46)',
    cardDeckBg: 'rgba(255, 255, 255, 0.32)',
    pillBg: 'rgba(255, 255, 255, 0.58)',
    pillBorder: 'rgba(255, 255, 255, 0.50)',
    border: 'rgba(255, 255, 255, 0.42)',
    borderSubtle: 'rgba(255, 255, 255, 0.28)',
    specularRim: 'rgba(255, 255, 255, 0.65)',
    headerBg: 'rgba(255, 255, 255, 0.38)',
    modalBg: 'rgba(255, 255, 255, 0.68)',
    tintBg: 'rgba(255, 255, 255, 0.35)',
  },
  dark: {
    panelBg: 'rgba(22, 24, 32, 0.58)',
    cardBg: 'rgba(18, 20, 28, 0.52)',
    cardDeckBg: 'rgba(14, 15, 20, 0.42)',
    pillBg: 'rgba(255, 255, 255, 0.08)',
    pillBorder: 'rgba(255, 255, 255, 0.14)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    specularRim: 'rgba(255, 255, 255, 0.25)',
    headerBg: 'rgba(18, 20, 26, 0.48)',
    modalBg: 'rgba(22, 24, 32, 0.72)',
    tintBg: 'rgba(18, 20, 28, 0.45)',
  },
} as const;

export type ThemeName = keyof typeof colors;
