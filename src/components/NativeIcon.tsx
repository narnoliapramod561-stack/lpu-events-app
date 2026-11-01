import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

export type IconName =
  | 'calendar' | 'calendar-days' | 'calendar-range' | 'clock' | 'ticket'
  | 'sparkles' | 'layout-grid' | 'flame' | 'map-pin' | 'arrow-right'
  | 'arrow-left' | 'external-link' | 'share' | 'search' | 'sun' | 'moon' | 'menu'
  | 'home' | 'users' | 'info' | 'mail' | 'copy' | 'check' | 'x' | 'refresh'
  | 'shield-alert' | 'shield-check' | 'qrcode' | 'whatsapp' | 'award' | 'briefcase'
  | 'graduation-cap' | 'heart' | 'lightbulb' | 'chevron-left' | 'chevron-right' | 'arrow-up-right'
  | 'book-open' | 'flag' | 'shield' | 'hand-heart' | 'shirt' | 'more-horizontal' | 'layers';

export function NativeIcon({ name, size = 16, color = '#0f172a', strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  const content = (() => {
    switch (name) {
      case 'calendar': return <><Rect {...common} x="3" y="4" width="18" height="17" rx="2" /><Line {...common} x1="16" y1="2" x2="16" y2="6" /><Line {...common} x1="8" y1="2" x2="8" y2="6" /><Line {...common} x1="3" y1="10" x2="21" y2="10" /></>;
      case 'calendar-days': return <><Rect {...common} x="3" y="4" width="18" height="17" rx="2" /><Line {...common} x1="16" y1="2" x2="16" y2="6" /><Line {...common} x1="8" y1="2" x2="8" y2="6" /><Line {...common} x1="3" y1="10" x2="21" y2="10" /><Line {...common} x1="8" y1="14" x2="8" y2="14" /><Line {...common} x1="12" y1="14" x2="12" y2="14" /><Line {...common} x1="16" y1="14" x2="16" y2="14" /><Line {...common} x1="8" y1="18" x2="8" y2="18" /><Line {...common} x1="12" y1="18" x2="12" y2="18" /><Line {...common} x1="16" y1="18" x2="16" y2="18" /></>;
      case 'calendar-range': return <><Rect {...common} x="3" y="4" width="18" height="17" rx="2" /><Line {...common} x1="16" y1="2" x2="16" y2="6" /><Line {...common} x1="8" y1="2" x2="8" y2="6" /><Line {...common} x1="3" y1="10" x2="21" y2="10" /><Line {...common} x1="8" y1="14" x2="16" y2="14" /><Line {...common} x1="8" y1="18" x2="12" y2="18" /></>;
      case 'clock': return <><Circle {...common} cx="12" cy="12" r="9" /><Polyline {...common} points="12 7 12 12 15 14" /></>;
      case 'ticket': return <><Path {...common} d="M20 12a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3Z" /><Path {...common} d="M13 5v2M13 17v2M13 11v2" /></>;
      case 'sparkles': return <><Path {...common} d="m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6L12 3Z" /><Path {...common} d="m5 17-.7 2-2 .7 2 .7.7 2 .7-2 2-.7-2-.7L5 17ZM19 14l-.6 1.4-1.4.6 1.4.6.6 1.4.6-1.4 1.4-.6-1.4-.6L19 14Z" /></>;
      case 'layout-grid': return <><Rect {...common} x="3" y="3" width="7" height="7" rx="1" /><Rect {...common} x="14" y="3" width="7" height="7" rx="1" /><Rect {...common} x="3" y="14" width="7" height="7" rx="1" /><Rect {...common} x="14" y="14" width="7" height="7" rx="1" /></>;
      case 'flame': return <Path {...common} d="M12 22c4.4 0 8-3.1 8-7.5 0-3.1-1.8-5.8-4.5-8.5.1 2.2-1.1 3.8-2.5 4.5.2-3.5-1.4-6.3-4-8.5.1 3.3-1 5.4-2.5 7.2C5.1 10.8 4 12.5 4 14.5 4 18.9 7.6 22 12 22Z" />;
      case 'map-pin': return <><Path {...common} d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><Circle {...common} cx="12" cy="10" r="2.5" /></>;
      case 'arrow-right': return <><Line {...common} x1="4" y1="12" x2="20" y2="12" /><Polyline {...common} points="14 6 20 12 14 18" /></>;
      case 'arrow-left': return <><Line {...common} x1="20" y1="12" x2="4" y2="12" /><Polyline {...common} points="10 6 4 12 10 18" /></>;
      case 'arrow-up-right': return <><Line {...common} x1="7" y1="17" x2="17" y2="7" /><Polyline {...common} points="7 7 17 7 17 17" /></>;
      case 'external-link': return <><Path {...common} d="M14 4h6v6M20 4l-9 9" /><Path {...common} d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>;
      case 'share': return <><Circle {...common} cx="18" cy="5" r="2.5" /><Circle {...common} cx="6" cy="12" r="2.5" /><Circle {...common} cx="18" cy="19" r="2.5" /><Line {...common} x1="8.3" y1="10.8" x2="15.7" y2="6.2" /><Line {...common} x1="8.3" y1="13.2" x2="15.7" y2="17.8" /></>;
      case 'search': return <><Circle {...common} cx="11" cy="11" r="7" /><Line {...common} x1="20" y1="20" x2="16" y2="16" /></>;
      case 'sun': return <><Circle {...common} cx="12" cy="12" r="4" /><Path {...common} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>;
      case 'moon': return <Path {...common} d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />;
      case 'menu': return <><Line {...common} x1="4" y1="6" x2="20" y2="6" /><Line {...common} x1="4" y1="12" x2="20" y2="12" /><Line {...common} x1="4" y1="18" x2="20" y2="18" /></>;
      case 'home': return <><Path {...common} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline {...common} points="9 22 9 12 15 12 15 22" /></>;
      case 'users': return <><Path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><Circle {...common} cx="9" cy="7" r="4" /><Path {...common} d="M22 21v-2a4 4 0 0 0-3-3.87" /><Path {...common} d="M16 3.13a4 4 0 0 1 0 7.75" /></>;
      case 'info': return <><Circle {...common} cx="12" cy="12" r="10" /><Line {...common} x1="12" y1="16" x2="12" y2="12" /><Line {...common} x1="12" y1="8" x2="12.01" y2="8" /></>;
      case 'mail': return <><Rect {...common} x="2" y="4" width="20" height="16" rx="2" /><Path {...common} d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>;
      case 'copy': return <><Rect {...common} x="9" y="9" width="13" height="13" rx="2" ry="2" /><Path {...common} d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>;
      case 'check': return <Polyline {...common} points="20 6 9 17 4 12" />;
      case 'x': return <><Line {...common} x1="18" y1="6" x2="6" y2="18" /><Line {...common} x1="6" y1="6" x2="18" y2="18" /></>;
      case 'refresh': return <><Path {...common} d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><Path {...common} d="M3 3v5h5" /><Path {...common} d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><Path {...common} d="M16 16h5v5" /></>;
      case 'shield-alert': return <><Path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Line {...common} x1="12" y1="8" x2="12" y2="12" /><Line {...common} x1="12" y1="16" x2="12.01" y2="16" /></>;
      case 'shield-check': return <><Path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Path {...common} d="m9 12 2 2 4-4" /></>;
      case 'qrcode': return <><Rect {...common} x="3" y="3" width="7" height="7" /><Rect {...common} x="14" y="3" width="7" height="7" /><Rect {...common} x="14" y="14" width="7" height="7" /><Rect {...common} x="3" y="14" width="7" height="7" /></>;
      case 'whatsapp': return <Path {...common} d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.53.08-.8.38s-1.06 1.03-1.06 2.51 1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.15 4.55.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35ZM12 2a10 10 0 0 0-8.66 15L2 22l5.13-1.35A10 10 0 1 0 12 2Z" />;
      case 'award': return <><Circle {...common} cx="12" cy="8" r="6" /><Polyline {...common} points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>;
      case 'briefcase': return <><Rect {...common} x="2" y="7" width="20" height="14" rx="2" ry="2" /><Path {...common} d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>;
      case 'graduation-cap': return <><Path {...common} d="M22 10v6M2 10l10-5 10 5-10 5z" /><Path {...common} d="M6 12v5c3 3 9 3 12 0v-5" /></>;
      case 'heart': return <Path {...common} d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />;
      case 'lightbulb': return <><Path {...common} d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><Path {...common} d="M9 18h6" /><Path {...common} d="M10 22h4" /></>;
      case 'chevron-left': return <Polyline {...common} points="15 18 9 12 15 6" />;
      case 'chevron-right': return <Polyline {...common} points="9 18 15 12 9 6" />;
      case 'book-open': return <><Path {...common} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><Path {...common} d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>;
      case 'flag': return <><Path {...common} d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><Line {...common} x1="4" y1="22" x2="4" y2="15" /></>;
      case 'shield': return <Path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
      case 'hand-heart': return <><Path {...common} d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" /><Path {...common} d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" /><Path {...common} d="m2 15 6 6" /><Path {...common} d="M19.5 8.5c.7-.7 1.5-1.5 1.5-2.5A2.5 2.5 0 0 0 18.5 3.5c-1.2 0-2 .8-2.5 1.5-.5-.7-1.3-1.5-2.5-1.5A2.5 2.5 0 0 0 11 6c0 1 .8 1.8 1.5 2.5l3.5 3.5Z" /></>;
      case 'shirt': return <Path {...common} d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />;
      case 'more-horizontal': return <><Circle {...common} cx="12" cy="12" r="1.5" /><Circle {...common} cx="19" cy="12" r="1.5" /><Circle {...common} cx="5" cy="12" r="1.5" /></>;
      case 'layers': return <><Path {...common} d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><Path {...common} d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5" /><Path {...common} d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5" /></>;
    }
  })();
  return <Svg width={size} height={size} viewBox="0 0 24 24">{content}</Svg>;
}
