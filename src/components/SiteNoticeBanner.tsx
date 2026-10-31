import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeIcon } from './NativeIcon';

interface SiteNoticeBannerProps {
  bannerData: any;
  dark: boolean;
}

export function SiteNoticeBanner({ bannerData, dark }: SiteNoticeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !bannerData) return null;

  let message = '';
  let urgency: 'info' | 'warning' | 'critical' = 'info';
  let ctaLabel: string | undefined;
  let ctaUrl: string | undefined;

  if (typeof bannerData === 'string' && bannerData.trim()) {
    message = bannerData.trim();
  } else if (typeof bannerData === 'object' && bannerData !== null) {
    if (bannerData.is_active === false) return null;
    message = String(bannerData.message || '').trim();
    if (bannerData.urgency === 'warning' || bannerData.urgency === 'critical') {
      urgency = bannerData.urgency;
    }
    ctaLabel = bannerData.cta_label;
    ctaUrl = bannerData.cta_url;
  }

  if (!message) return null;

  const handleCta = () => {
    if (ctaUrl && /^https?:\/\//i.test(ctaUrl)) {
      Linking.openURL(ctaUrl).catch(() => {});
    }
  };

  const bgColors = {
    info: dark ? 'rgba(37,99,235,0.22)' : 'rgba(219,234,254,0.92)',
    warning: dark ? 'rgba(217,119,6,0.22)' : 'rgba(254,243,199,0.95)',
    critical: dark ? 'rgba(225,29,72,0.25)' : 'rgba(254,226,226,0.95)',
  }[urgency];

  const textColors = {
    info: dark ? '#93c5fd' : '#1e40af',
    warning: dark ? '#fcd34d' : '#92400e',
    critical: dark ? '#fda4af' : '#9f1239',
  }[urgency];

  return (
    <View style={[styles.banner, { backgroundColor: bgColors }]}>
      <View style={styles.textWrap}>
        <NativeIcon
          name={urgency === 'critical' ? 'shield-alert' : 'info'}
          size={14}
          color={textColors}
        />
        <Text style={[styles.message, { color: textColors }]}>{message}</Text>
        {ctaLabel && ctaUrl ? (
          <Pressable onPress={handleCta}>
            <Text style={[styles.ctaText, { color: textColors }]}>{ctaLabel} →</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={() => setDismissed(true)} style={styles.dismissBtn}>
        <NativeIcon name="x" size={13} color={textColors} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  textWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  message: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  dismissBtn: {
    padding: 4,
  },
});
