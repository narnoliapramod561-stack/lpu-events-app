import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicApiClient } from '../../src/api/publicApi';
import type { EventDetails } from '../../src/api/types';
import { eventImageSource } from '../../src/features/homepageModels';
import { formatEventDateRange } from '../../src/features/eventHub';
import { colors, radii, shadows, spacing } from '../../src/design/tokens';
import { NativeIcon, type IconName } from '../../src/components/NativeIcon';
import { useTheme } from '../../src/theme/ThemeContext';
import { isSafeExternalUrl, openExternalUrl } from '../../src/utils/externalLinks';

const api = new PublicApiClient();
const dateText = (event: EventDetails) => formatEventDateRange(event.start_at, event.end_at) || 'Date to be announced';
const timeText = (event: EventDetails) => {
  const start = new Date(event.start_at);
  if (Number.isNaN(start.getTime())) return 'Time to be announced';
  const format = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const end = new Date(event.end_at);
  return Number.isNaN(end.getTime()) ? format(start) : `${format(start)} – ${format(end)}`;
};

function Skeleton({ dark }: { dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  return <View style={styles.skeleton}><View style={[styles.skeletonPoster, { backgroundColor: palette.surface2 }]} /><View style={[styles.skeletonLine, { backgroundColor: palette.surface2, width: '78%' }]} /><View style={[styles.skeletonLine, { backgroundColor: palette.surface2, width: '45%' }]} /><View style={[styles.skeletonPanel, { backgroundColor: palette.surface2 }]} /></View>;
}

function InfoRow({ icon, label, value, dark, tone, last }: { icon: IconName; label: string; value: string; dark: boolean; tone: 'orange' | 'yellow' | 'pink'; last?: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  const toneColors = {
    orange: { icon: '#f97316', background: 'rgba(249,115,22,0.12)' },
    yellow: { icon: '#d97706', background: 'rgba(245,158,11,0.14)' },
    pink: { icon: '#f43f5e', background: 'rgba(244,63,94,0.11)' },
  }[tone];
  return <View style={[styles.infoRow, { borderBottomColor: palette.outline }, last && styles.infoRowLast]}>
    <View style={[styles.infoIcon, { backgroundColor: dark ? 'rgba(255,255,255,.08)' : toneColors.background }]}><NativeIcon name={icon} size={20} color={dark ? '#fff' : toneColors.icon} /></View>
    <View style={styles.infoCopy}><Text style={[styles.infoLabel, { color: dark ? palette.text : toneColors.icon }]}>{label}</Text><Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text></View>
  </View>;
}

function contentText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    for (const key of ['text', 'description', 'body', 'markdown']) if (typeof record[key] === 'string') return record[key].trim();
  }
  return '';
}

function SectionContent({ content, dark }: { content: unknown; dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  const text = contentText(content);
  if (text) return <View style={styles.contentText}>{text.split('\n').map((line, index) => {
    const clean = line.trim();
    if (!clean) return <View key={index} style={{ height: 10 }} />;
    const bullet = /^[-•*]\s+/.test(clean);
    const numbered = /^\d+[.)]\s+/.test(clean);
    return <View key={index} style={bullet || numbered ? styles.listRow : undefined}>{bullet ? <Text style={[styles.bullet, { color: palette.primary }]}>•</Text> : null}<Text style={[styles.description, { color: palette.text }]}>{numbered ? clean.replace(/^\d+[.)]\s+/, '') : bullet ? clean.replace(/^[-•*]\s+/, '') : clean}</Text></View>;
  })}</View>;
  if (content && typeof content === 'object') return <View>{Object.entries(content as Record<string, unknown>).map(([key, value]) => <View key={key} style={[styles.keyValue, { borderColor: palette.outline }]}><Text style={[styles.infoLabel, { color: palette.primary }]}>{key.replace(/_/g, ' ')}</Text><Text style={[styles.description, { color: palette.text }]}>{typeof value === 'string' ? value : JSON.stringify(value)}</Text></View>)}</View>;
  return <Text style={[styles.description, { color: palette.mutedText }]}>No detailed content has been provided for this section yet.</Text>;
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = Array.isArray(id) ? id[0] : id ?? '';
  const { dark } = useTheme();
  const palette = dark ? colors.dark : colors.light;
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('about');
  const [imageFailed, setImageFailed] = useState(false);

  const load = useCallback(async (force = false) => {
    if (!eventId) { setLoading(false); setErrorMessage('A valid event identifier is required.'); return; }
    if (force) setRefreshing(true); else setLoading(true);
    setErrorMessage(null);
    const result = await api.getEventDetails(eventId);
    if (result.data) { setEvent(result.data); setImageFailed(false); } else setErrorMessage(result.error.code === 'HTTP_ERROR' && result.error.status === 404 ? 'This event could not be found.' : result.error.message);
    setLoading(false); setRefreshing(false);
  }, [eventId]);
  useEffect(() => { void load(); }, [load]);

  const sections = useMemo(() => {
    const source = (event?.event_content_sections ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const about = source.find((item) => /about|overview/i.test(item.title) || item.section_type.toUpperCase() === 'ABOUT');
    return [{ id: 'about', title: 'About the Event', content: contentText(about?.content) || event?.description || '' }, ...source.filter((item) => item !== about).map((item) => ({ id: item.id, title: item.title, content: item.content }))];
  }, [event]);
  const currentSection = sections.find((item) => item.id === activeSection) ?? sections[0];
  const externalUrl = isSafeExternalUrl(event?.external_registration_url) ? event.external_registration_url : null;
  const image = event && !imageFailed ? eventImageSource(event) : undefined;

  const openBooking = async () => { if (externalUrl) await openExternalUrl(externalUrl, 'registration'); };
  const shareEvent = async () => { if (event) await Share.share({ message: `${event.name}\n${event.venue_name}\n${dateText(event)}` }); };
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/'); };

  return <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
    <ImageBackground source={require('../../assets/lpu-events-campus-glass-background.webp')} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.backgroundImage}><View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(14,14,18,.62)' : 'rgba(244,247,251,.04)' }]} /></ImageBackground>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={palette.primary} />}>
      <View style={styles.topbar}><Pressable onPress={goBack} accessibilityRole="button" style={[styles.back, { borderColor: palette.outline, backgroundColor: palette.surface }]}><NativeIcon name="arrow-left" size={17} color={palette.text} /><Text style={[styles.backText, { color: palette.text }]}>Back to events</Text></Pressable><Pressable onPress={() => void shareEvent()} accessibilityLabel="Share event" style={[styles.share, { borderColor: palette.outline, backgroundColor: palette.surface }]}><NativeIcon name="share" size={16} color={palette.primary} /><Text style={[styles.backText, { color: palette.text }]}>Share</Text></Pressable></View>
      {loading && !event ? <Skeleton dark={dark} /> : null}
      {!loading && !event ? <View style={styles.center}><Text style={[styles.errorTitle, { color: palette.text }]}>Event Not Found</Text><Text style={[styles.description, { color: palette.mutedText }]}>{errorMessage ?? 'This event could not be found.'}</Text><Pressable onPress={() => void load(true)} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}
      {event ? <><View style={[styles.posterFrame, { backgroundColor: dark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.48)', borderColor: palette.outline }]}><Image source={image ?? undefined} resizeMode="contain" style={styles.poster} onError={() => setImageFailed(true)} /><View style={styles.badge}><Text style={styles.badgeText}>{event.pricing_type === 'PAID' ? 'PAID EVENT' : 'FREE EVENT'}</Text></View></View>
        <Text style={[styles.title, { color: palette.text }]}>{event.name}</Text>
        {event.status === 'CANCELLED' ? <View style={styles.cancelled}><Text style={styles.cancelledTitle}>Event Cancelled</Text><Text style={styles.cancelledText}>This event was cancelled by the organizers.</Text></View> : null}
        <Text style={[styles.organizer, { color: palette.primary }]}>Organized by {event.organizations?.name || 'LPU Organization'}</Text>
        <View style={[styles.infoPanel, { backgroundColor: palette.surface, borderColor: palette.outline }]}><InfoRow icon="calendar" label="DATE" value={dateText(event)} dark={dark} tone="orange" /><InfoRow icon="clock" label="TIME" value={timeText(event)} dark={dark} tone="yellow" /><InfoRow icon="map-pin" label="VENUE" value={event.venue_name || 'LPU Campus'} dark={dark} tone="pink" last /></View>
        <View style={[styles.tabs, { backgroundColor: palette.surface, borderColor: palette.outline }]}>{sections.map((section) => <Pressable key={section.id} onPress={() => setActiveSection(section.id)} style={[styles.tab, activeSection === section.id && styles.activeTab]}><Text style={[styles.tabText, { color: activeSection === section.id ? '#fff' : palette.variantText }]}>{section.title}</Text></Pressable>)}</View>
        <View style={[styles.contentPanel, { backgroundColor: palette.surface, borderColor: palette.outline }]}><SectionContent content={currentSection?.content} dark={dark} /></View>
        {externalUrl ? <Pressable onPress={() => void openBooking()} style={styles.booking}><Text style={styles.bookingText}>Book Ticket</Text><NativeIcon name="external-link" size={16} color="#fff" /></Pressable> : null}
      </> : null}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, backgroundImage: { opacity: 0.9 }, content: { padding: spacing.gutter, paddingBottom: 36 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }, back: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 9, borderRadius: radii.sm, borderWidth: 1 }, share: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: radii.pill, borderWidth: 1 }, backText: { fontSize: 12, fontWeight: '700' },
  posterFrame: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.md, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, ...shadows.glass }, poster: { width: '100%', height: '100%' }, badge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,.68)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { color: '#fcd34d', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '900', marginBottom: spacing.sm }, organizer: { fontSize: 13, fontWeight: '800', marginBottom: spacing.md }, infoPanel: { borderRadius: radii.md, borderWidth: 1, paddingHorizontal: spacing.md, marginBottom: spacing.lg, ...shadows.glass }, infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md, borderBottomWidth: 1, borderStyle: 'dashed' }, infoRowLast: { borderBottomWidth: 0 }, infoIcon: { width: 42, height: 42, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' }, infoCopy: { flex: 1 }, infoLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 3 }, infoValue: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 5, padding: 5, borderWidth: 1, borderRadius: radii.sm, marginBottom: spacing.md }, tab: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, maxWidth: 190 }, activeTab: { backgroundColor: '#ff6b00' }, tabText: { fontSize: 12, fontWeight: '700' }, contentPanel: { borderWidth: 1, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg }, contentText: { gap: 4 }, description: { fontSize: 15, lineHeight: 25, fontWeight: '500' }, listRow: { flexDirection: 'row', gap: 8 }, bullet: { fontSize: 20, lineHeight: 25, fontWeight: '900' }, keyValue: { padding: 12, borderWidth: 1, borderRadius: radii.sm, marginBottom: 8 }, booking: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#ff6b00', borderRadius: radii.pill, paddingVertical: 14, marginBottom: 8, ...shadows.orange }, bookingText: { color: '#fff', fontSize: 14, fontWeight: '900' }, cancelled: { padding: 14, borderRadius: radii.sm, borderWidth: 1, borderColor: 'rgba(244,63,94,.3)', backgroundColor: 'rgba(244,63,94,.1)', marginBottom: spacing.md }, cancelledTitle: { color: '#e11d48', fontWeight: '900', marginBottom: 4 }, cancelledText: { color: '#9f1239', fontSize: 13 }, center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 10 }, errorTitle: { fontSize: 20, fontWeight: '900' }, retry: { backgroundColor: '#ff6b00', borderRadius: radii.sm, paddingHorizontal: 20, paddingVertical: 11, marginTop: 8 }, retryText: { color: '#fff', fontWeight: '800' }, skeleton: { gap: 14 }, skeletonPoster: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.md }, skeletonLine: { height: 22, borderRadius: 10 }, skeletonPanel: { height: 190, borderRadius: radii.md },
});
