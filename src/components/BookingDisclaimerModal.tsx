import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, shadows, spacing, typography } from '../design/tokens';
import { NativeIcon } from './NativeIcon';

interface BookingDisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: any;
  dark: boolean;
}

export function BookingDisclaimerModal({
  visible,
  onClose,
  onConfirm,
  event,
  dark,
}: BookingDisclaimerModalProps) {
  if (!visible || !event) return null;

  const eventName = event.name || 'this event';
  const organizerName = event.organizations?.name || 'the event organizer';
  const targetUrl = event.external_registration_url || '';

  let targetHost = 'External Partner';
  try {
    if (targetUrl) {
      // Basic hostname extraction for native
      const match = targetUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i);
      if (match && match[1]) targetHost = match[1];
    }
  } catch {
    targetHost = 'External Partner';
  }

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

          {/* Header Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <NativeIcon name="sparkles" size={12} color="#ea580c" />
              <Text style={styles.badgeText}>EXTERNAL TICKETING</Text>
            </View>
          </View>

          {/* Title & Introduction */}
          <Text style={[styles.title, { color: dark ? '#ffffff' : '#0f172a' }]}>
            You are leaving LPU Events
          </Text>
          <Text style={[styles.intro, { color: dark ? '#cbd5e1' : '#475569' }]}>
            You are being redirected to <Text style={styles.boldText}>{targetHost}</Text> to book
            tickets for <Text style={styles.primaryBold}>{eventName}</Text>.
          </Text>

          {/* Two Clean Highlight Cards */}
          <View style={styles.cardsWrap}>
            {/* Card 1: Organizer Info */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)',
                  borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={styles.cardIconWrap}>
                <NativeIcon name="ticket" size={18} color="#ea580c" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: dark ? '#ffffff' : '#0f172a' }]}>
                  Managed by {organizerName}
                </Text>
                <Text style={[styles.cardText, { color: dark ? '#94a3b8' : '#64748b' }]}>
                  Ticket pricing, seat allocation, and booking confirmations are handled directly by
                  the organizer on {targetHost}.
                </Text>
              </View>
            </View>

            {/* Card 2: Plain English Disclaimer */}
            <View
              style={[
                styles.infoCard,
                styles.noticeCard,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(254,243,199,0.5)',
                  borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(251,191,36,0.4)',
                },
              ]}
            >
              <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                <NativeIcon name="shield-alert" size={18} color="#d97706" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: dark ? '#ffffff' : '#0f172a' }]}>
                  Important Notice
                </Text>
                <Text style={[styles.cardText, { color: dark ? '#cbd5e1' : '#475569' }]}>
                  LPU Events is a campus discovery directory only.{' '}
                  <Text style={styles.boldText}>
                    This site is not responsible for ticket bookings, cancellations, payments, or
                    refunds.
                  </Text>{' '}
                  Please contact the organizer for any booking assistance.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              onPress={onClose}
              style={[
                styles.secondaryBtn,
                { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Text style={[styles.secondaryBtnText, { color: dark ? '#e2e8f0' : '#475569' }]}>
                Go Back
              </Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Continue to Book Ticket</Text>
              <NativeIcon name="arrow-up-right" size={15} color="#ffffff" />
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
    maxWidth: 420,
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
    marginBottom: 6,
  },
  intro: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '900',
  },
  primaryBold: {
    fontWeight: '900',
    color: '#ff6b00',
  },
  cardsWrap: {
    gap: 10,
    marginBottom: 18,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  noticeCard: {},
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },
  cardText: {
    fontSize: 11,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  primaryBtn: {
    flex: 2,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ff6b00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
