import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeAdvertisement } from '../api/types';
import { radii, spacing, typography } from '../design/tokens';
import { mediaUrl } from '../features/homepageModels';
import { openExternalUrl } from '../utils/externalLinks';

interface DirectAdBannerProps {
  ad: NativeAdvertisement;
  dark: boolean;
  compact?: boolean;
}

function DirectAdBannerComponent({ ad, dark, compact = false }: DirectAdBannerProps) {
  const image = mediaUrl(ad.media_assets);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={ad.name}
      onPress={() => {
        if (ad.redirect_url) void openExternalUrl(ad.redirect_url, 'advertisement');
      }}
      style={[styles.container, compact && styles.compact, { borderColor: dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.3)' }]}
    >
      {image ? (
        <Image source={{ uri: image }} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.tag}>SPONSORED</Text>
          <Text numberOfLines={1} style={styles.title}>{ad.name}</Text>
          <Text style={styles.action}>Explore →</Text>
        </View>
      )}
      {image ? <View style={styles.imageShade} /> : null}
      {image ? <Text numberOfLines={1} style={styles.imageTitle}>{ad.name}</Text> : null}
    </Pressable>
  );
}

export const DirectAdBanner = memo(DirectAdBannerComponent);

const styles = StyleSheet.create({
  container: { height: 72, borderRadius: radii.md, overflow: 'hidden', borderWidth: 1, marginTop: spacing.md },
  compact: { height: 62 },
  fallback: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm, backgroundColor: '#17152f' },
  tag: { color: '#a5b4fc', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { flex: 1, color: '#fff', fontSize: typography.sizes.body, fontWeight: '800' },
  action: { color: '#fff', backgroundColor: '#4f46e5', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, fontWeight: '800', fontSize: 11 },
  imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)' },
  imageTitle: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, color: '#fff', fontWeight: '800', fontSize: typography.sizes.body },
});
