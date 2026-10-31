import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LpuEventsLogo } from './LpuEventsLogo';
import { NativeIcon } from './NativeIcon';
import { radii, shadows, spacing, typography } from '../design/tokens';

interface MaintenanceViewProps {
  onRetry: () => void;
  message?: string;
  description?: string;
  estimatedResumption?: string | null;
  contactEmail?: string;
}

export function MaintenanceView({
  onRetry,
  message,
  description,
  estimatedResumption,
  contactEmail = 'support@lpuevents.live',
}: MaintenanceViewProps) {
  const [retrying, setRetrying] = useState(false);

  const formattedResumption = useMemo(() => {
    if (!estimatedResumption || !estimatedResumption.trim()) return null;
    try {
      const targetDate = new Date(estimatedResumption.trim());
      if (Number.isNaN(targetDate.getTime())) return estimatedResumption.trim();
      return targetDate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return estimatedResumption.trim();
    }
  }, [estimatedResumption]);

  const handleManualRetry = () => {
    setRetrying(true);
    onRetry();
    setTimeout(() => {
      setRetrying(false);
    }, 1200);
  };

  const explanation =
    message && message.trim().length > 0
      ? message.trim()
      : 'We are currently making scheduled platform updates to improve your campus event experience.';

  const subDescription =
    description && description.trim().length > 0
      ? description.trim()
      : 'All registered event tickets, team rosters, and student submissions remain fully secure.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <LpuEventsLogo size={42} />
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>
              <Text style={{ color: '#ffffff' }}>LPU </Text>
              <Text style={{ color: '#ff6b00' }}>Events</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Student Directory</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>Maintenance</Text>
        </View>
      </View>

      {/* Main Content Hero */}
      <View style={styles.content}>
        <Text style={styles.headline}>We’ll be back shortly.</Text>

        <Text style={styles.explanation}>{explanation}</Text>

        {/* Resumption Time */}
        {formattedResumption ? (
          <View style={styles.resumptionPill}>
            <NativeIcon name="clock" size={14} color="#ff6b00" />
            <Text style={styles.resumptionText}>
              Expected: <Text style={styles.resumptionBold}>{formattedResumption}</Text>
            </Text>
          </View>
        ) : null}

        {/* Reassurance text */}
        <View style={styles.reassuranceRow}>
          <NativeIcon name="shield-check" size={16} color="#34d399" />
          <Text style={styles.reassuranceText}>{subDescription}</Text>
        </View>

        {/* Action Button: Check Status */}
        <Pressable
          onPress={handleManualRetry}
          disabled={retrying}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Check maintenance status"
        >
          {retrying ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <NativeIcon name="refresh" size={15} color="#000000" />
          )}
          <Text style={styles.retryButtonText}>
            {retrying ? 'Checking status…' : 'Check status'}
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerUniversity}>
          Lovely Professional University • Campus Events Hub
        </Text>
        <Pressable
          onPress={() => void Linking.openURL(`mailto:${contactEmail}`).catch(() => {})}
          style={styles.emailPressable}
        >
          <Text style={styles.footerEmail}>Urgent inquiries: {contactEmail}</Text>
          <NativeIcon name="arrow-up-right" size={12} color="#94a3b8" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090a0f',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTextWrap: {
    gap: 1,
  },
  brandTitle: {
    fontFamily: typography.headingFamily,
    fontSize: 19,
    fontWeight: '900',
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
  },
  statusText: {
    color: '#fcd34d',
    fontSize: 10.5,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: spacing.gutter,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  headline: {
    fontFamily: typography.headingFamily,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 22,
    color: '#cbd5e1',
    textAlign: 'center',
    maxWidth: 320,
  },
  resumptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  resumptionText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  resumptionBold: {
    color: '#ffffff',
    fontWeight: '900',
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  reassuranceText: {
    color: '#94a3b8',
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: radii.pill,
    shadowColor: '#ffffff',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 6,
  },
  footerUniversity: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
  },
  emailPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerEmail: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
});
