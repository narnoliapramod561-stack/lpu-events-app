import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

export type IconName =
  | 'calendar' | 'calendar-days' | 'calendar-range' | 'clock' | 'ticket'
  | 'sparkles' | 'layout-grid' | 'flame' | 'map-pin' | 'arrow-right'
  | 'arrow-left' | 'external-link' | 'share' | 'search' | 'sun' | 'moon' | 'menu';

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
      case 'external-link': return <><Path {...common} d="M14 4h6v6M20 4l-9 9" /><Path {...common} d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>;
      case 'share': return <><Circle {...common} cx="18" cy="5" r="2.5" /><Circle {...common} cx="6" cy="12" r="2.5" /><Circle {...common} cx="18" cy="19" r="2.5" /><Line {...common} x1="8.3" y1="10.8" x2="15.7" y2="6.2" /><Line {...common} x1="8.3" y1="13.2" x2="15.7" y2="17.8" /></>;
      case 'search': return <><Circle {...common} cx="11" cy="11" r="7" /><Line {...common} x1="20" y1="20" x2="16" y2="16" /></>;
      case 'sun': return <><Circle {...common} cx="12" cy="12" r="4" /><Path {...common} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>;
      case 'moon': return <Path {...common} d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />;
      case 'menu': return <><Line {...common} x1="4" y1="6" x2="20" y2="6" /><Line {...common} x1="4" y1="12" x2="20" y2="12" /><Line {...common} x1="4" y1="18" x2="20" y2="18" /></>;
    }
  })();
  return <Svg width={size} height={size} viewBox="0 0 24 24">{content}</Svg>;
}
