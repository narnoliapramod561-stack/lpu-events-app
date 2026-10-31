import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../design/tokens';

function ScheduleSectionComponent({ dark }: { dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  const options = ['All', 'Today', 'Tomorrow', 'This Week', 'Upcoming'];
  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: palette.text }]}>Timeline <Text style={styles.accent}>&amp; Schedule</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {options.map((option, index) => (
          <View key={option} style={[styles.pill, index === 0 ? styles.activePill : { backgroundColor: palette.surface, borderColor: palette.outline }]}>
            <Text style={[styles.pillText, index === 0 ? styles.activeText : { color: palette.variantText }]}>{option.toUpperCase()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export const ScheduleSection = memo(ScheduleSectionComponent);

const styles = StyleSheet.create({
  section: { marginHorizontal: spacing.gutter, marginTop: spacing.section, marginBottom: spacing.sm },
  heading: { fontFamily: typography.headingFamily, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  accent: { color: '#f97316' },
  pills: { gap: spacing.sm, paddingVertical: spacing.md },
  pill: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radii.md, borderWidth: 1, justifyContent: 'center' },
  activePill: { backgroundColor: '#f97316', borderColor: '#f97316' },
  pillText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  activeText: { color: '#fff' },
});
