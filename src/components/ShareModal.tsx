import React from 'react';
import {
  Linking,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radii, shadows, spacing, typography } from '../design/tokens';
import { NativeIcon } from './NativeIcon';
import { formatEventDateRange, formatEventTimeRange } from '../features/eventHub';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  event: any;
  dark: boolean;
}

export function ShareModal({ visible, onClose, event, dark }: ShareModalProps) {
  if (!visible || !event) return null;

  const eventName = event.name || 'Campus Event';
  const eventId = event.id || '';
  const shareUrl = `https://lpuevents.live/events/${eventId}`;

  const dateFormatted = event.start_at
    ? formatEventDateRange(event.start_at, event.end_at)
    : 'Date TBA';

  const timeFormatted = formatEventTimeRange(event.start_at, event.end_at) || 'Time TBA';

  const venueFormatted = event.venue_name || 'LPU Campus';
  const shareMessage = `🎉 Check out *${eventName}* at LPU!\n📅 Date: ${dateFormatted}\n⏰ Time: ${timeFormatted}\n📍 Venue: ${venueFormatted}\n\n👉 View details & register: ${shareUrl}`;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        title: eventName,
        message: shareMessage,
        url: shareUrl,
      });
      onClose();
    } catch {
      // dismissed
    }
  };

  const handleWhatsAppShare = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: dark ? '#222228' : '#ffffff',
              borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close dialog">
            <NativeIcon name="x" size={16} color={dark ? '#cbd5e1' : '#64748b'} />
          </Pressable>

          {/* Header */}
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <NativeIcon name="share" size={12} color="#ea580c" />
              <Text style={styles.badgeText}>SHARE CAMPUS EVENT</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: dark ? '#ffffff' : '#0f172a' }]}>
            Spread the Word
          </Text>
          <Text numberOfLines={2} style={[styles.eventName, { color: dark ? '#cbd5e1' : '#475569' }]}>
            {eventName}
          </Text>


          {/* Event Quick Snapshot Card */}
          <View
            style={[
              styles.snapshotCard,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)',
                borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <View style={styles.snapshotRow}>
              <NativeIcon name="calendar" size={14} color="#ea580c" />
              <Text style={[styles.snapshotText, { color: dark ? '#f1f5f9' : '#1e293b' }]}>
                {dateFormatted} • {timeFormatted}
              </Text>
            </View>
            <View style={styles.snapshotRow}>
              <NativeIcon name="map-pin" size={14} color="#f43f5e" />
              <Text style={[styles.snapshotText, { color: dark ? '#f1f5f9' : '#1e293b' }]}>
                {venueFormatted}
              </Text>
            </View>
          </View>

          {/* Share Action Buttons */}
          <View style={styles.actions}>
            {/* WhatsApp Share */}
            <Pressable
              onPress={() => void handleWhatsAppShare()}
              style={[styles.shareActionBtn, { backgroundColor: '#25D366' }]}
            >
              <NativeIcon name="whatsapp" size={18} color="#ffffff" />
              <Text style={styles.shareActionTextWhite}>Share via WhatsApp</Text>
            </Pressable>

            {/* Native System Share */}
            <Pressable
              onPress={() => void handleNativeShare()}
              style={[
                styles.shareActionBtn,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.12)' : '#0f172a',
                },
              ]}
            >
              <NativeIcon name="share" size={16} color="#ffffff" />
              <Text style={styles.shareActionTextWhite}>Share via Device Apps</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    position: 'relative',
    ...shadows.glass,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100,116,139,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,107,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.22)',
  },
  badgeText: {
    color: '#ea580c',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: typography.headingFamily,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22,163,74,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  toastText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '800',
  },
  snapshotCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    marginBottom: 16,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snapshotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
  },
  shareActionBtn: {
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareActionTextWhite: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
