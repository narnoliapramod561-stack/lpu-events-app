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
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  headingFamily: Platform.select({
    android: 'sans-serif',
    default: 'sans-serif',
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export const glass = {
  light: {
    panelBg: 'rgba(255, 255, 255, 0.62)',
    cardBg: 'rgba(255, 255, 255, 0.52)',
    cardDeckBg: 'rgba(255, 255, 255, 0.38)',
    pillBg: 'rgba(255, 255, 255, 0.68)',
    pillBorder: 'rgba(255, 255, 255, 0.90)',
    border: 'rgba(255, 255, 255, 0.85)',
    borderSubtle: 'rgba(255, 255, 255, 0.45)',
    specularRim: 'rgba(255, 255, 255, 0.98)',
    headerBg: 'rgba(255, 255, 255, 0.38)',
    modalBg: 'rgba(255, 255, 255, 0.72)',
    tintBg: 'rgba(255, 255, 255, 0.45)',
  },
  dark: {
    panelBg: 'rgba(26, 28, 38, 0.68)',
    cardBg: 'rgba(22, 24, 34, 0.62)',
    cardDeckBg: 'rgba(16, 17, 24, 0.50)',
    pillBg: 'rgba(255, 255, 255, 0.12)',
    pillBorder: 'rgba(255, 255, 255, 0.22)',
    border: 'rgba(255, 255, 255, 0.18)',
    borderSubtle: 'rgba(255, 255, 255, 0.10)',
    specularRim: 'rgba(255, 255, 255, 0.45)',
    headerBg: 'rgba(18, 20, 26, 0.48)',
    modalBg: 'rgba(22, 24, 32, 0.78)',
    tintBg: 'rgba(18, 20, 28, 0.55)',
  },
} as const;

export type ThemeName = keyof typeof colors;
