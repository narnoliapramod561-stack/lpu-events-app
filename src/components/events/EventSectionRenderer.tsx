import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from '../../design/tokens';
import { NativeIcon } from '../NativeIcon';

interface EventSectionRendererProps {
  content: unknown;
  dark: boolean;
  loading?: boolean;
}

export function extractSectionText(content: unknown): string | null {
  if (typeof content === 'string') return content.trim();
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    for (const key of ['text', 'description', 'body', 'markdown']) {
      if (typeof record[key] === 'string') return (record[key] as string).trim();
    }
  }
  return null;
}

export function EventSectionRenderer({ content, dark, loading = false }: EventSectionRendererProps) {
  const palette = dark ? colors.dark : colors.light;

  if (loading && !content) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', width: '100%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', width: '92%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', width: '80%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', width: '65%' }]} />
      </View>
    );
  }

  if (!content) {
    return (
      <Text style={[styles.emptyText, { color: palette.mutedText }]}>
        No detailed content has been provided for this section yet.
      </Text>
    );
  }

  // 1. Text extracted from string or object wrapper { text, description, body, markdown }
  const rawText = extractSectionText(content);
  if (rawText !== null && rawText.length > 0) {
    const lines = rawText.split('\n');
    return (
      <View style={styles.textContainer}>
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={index} style={styles.lineSpacer} />;
          }

          // H4 Heading: ### Title
          if (trimmed.startsWith('### ')) {
            const headingText = trimmed.replace(/^###\s*/, '');
            return (
              <Text key={index} style={[styles.h4Heading, { color: palette.text }]}>
                {headingText}
              </Text>
            );
          }

          // H3 Heading: ## Title
          if (trimmed.startsWith('## ')) {
            const headingText = trimmed.replace(/^##\s*/, '');
            return (
              <Text key={index} style={[styles.h3Heading, { color: palette.text }]}>
                {headingText}
              </Text>
            );
          }

          // Bullet Points (•, -, *)
          if (/^[-•*]\s+/.test(trimmed)) {
            const clean = trimmed.replace(/^[-•*]\s+/, '');
            return (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={[styles.bulletText, { color: palette.text }]}>
                  {clean}
                </Text>
              </View>
            );
          }

          // Numbered list item: 1. or 1)
          const numMatch = trimmed.match(/^(\d+[\.\)])\s*(.*)$/);
          if (numMatch) {
            const num = numMatch[1].replace(/[\.\)]/, '');
            const rest = numMatch[2];
            return (
              <View key={index} style={styles.numberedRow}>
                <View
                  style={[
                    styles.numberedBadge,
                    {
                      backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(234,88,12,0.12)',
                      borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(234,88,12,0.25)',
                    },
                  ]}
                >
                  <Text style={[styles.numberedBadgeText, { color: dark ? '#fcd34d' : '#ea580c' }]}>
                    {num}
                  </Text>
                </View>
                <Text style={[styles.numberedText, { color: palette.text }]}>
                  {rest}
                </Text>
              </View>
            );
          }

          // Key: Value pair pattern (e.g., Eligibility: Open to all, Venue: Hall A)
          const colonMatch = trimmed.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
          if (colonMatch && colonMatch[1].length < 35) {
            const key = colonMatch[1].trim();
            const val = colonMatch[2].trim();
            return (
              <View key={index} style={styles.keyValueInlineRow}>
                <Text style={[styles.keyValueInlineKey, { color: dark ? '#ffffff' : '#0f172a' }]}>
                  {key}:{' '}
                </Text>
                <Text style={[styles.keyValueInlineVal, { color: palette.text }]}>
                  {val}
                </Text>
              </View>
            );
          }

          // Standard paragraph line
          return (
            <Text key={index} style={[styles.bodyText, { color: palette.text }]}>
              {line}
            </Text>
          );
        })}
      </View>
    );
  }

  // Check object structure for specialized layouts
  if (typeof content === 'object' && content !== null) {
    const record = content as Record<string, unknown>;

    // 2. Schedule / Timeline Items (supports content.items OR content.schedule)
    const scheduleItems = Array.isArray(record.items)
      ? record.items
      : Array.isArray(record.schedule)
      ? record.schedule
      : null;

    if (scheduleItems && scheduleItems.length > 0) {
      return (
        <View style={styles.cardList}>
          {scheduleItems.map((item: any, i: number) => {
            const timeLabel = item.time || item.phase || `Phase ${i + 1}`;
            const title = item.title || item.details || item.activity || '';
            const description = item.description || '';
            return (
              <View
                key={i}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.scheduleBadge}>
                  <Text style={styles.scheduleBadgeText}>{timeLabel}</Text>
                </View>
                <View style={styles.scheduleCopy}>
                  {title ? (
                    <Text style={[styles.itemCardTitle, { color: palette.text }]}>{title}</Text>
                  ) : null}
                  {description ? (
                    <Text style={[styles.itemCardDescription, { color: palette.mutedText }]}>
                      {description}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    // 3. FAQ / Guidelines Items (supports content.faqs OR content.faq)
    const faqItems = Array.isArray(record.faqs)
      ? record.faqs
      : Array.isArray(record.faq)
      ? record.faq
      : null;

    if (faqItems && faqItems.length > 0) {
      return (
        <View style={styles.cardList}>
          {faqItems.map((faq: any, i: number) => {
            const question = faq.question || faq.q || '';
            const answer = faq.answer || faq.a || '';
            return (
              <View
                key={i}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.faqHeaderRow}>
                  <View style={styles.faqQBadge}>
                    <Text style={styles.faqQBadgeText}>Q</Text>
                  </View>
                  <Text style={[styles.faqQuestionText, { color: palette.text }]}>
                    {question}
                  </Text>
                </View>
                {answer ? (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={[styles.faqAnswerText, { color: dark ? '#cbd5e1' : '#334155' }]}>
                      {answer}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      );
    }

    // 4. Rules List (supports content.rules_list OR content.rules)
    const rulesList = Array.isArray(record.rules_list)
      ? record.rules_list
      : Array.isArray(record.rules)
      ? record.rules
      : null;

    if (rulesList && rulesList.length > 0) {
      return (
        <View style={styles.cardList}>
          {rulesList.map((rule: any, i: number) => {
            const ruleText =
              typeof rule === 'string' ? rule : rule.text || rule.title || JSON.stringify(rule);
            return (
              <View
                key={i}
                style={[
                  styles.ruleCard,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.ruleIconBox}>
                  <NativeIcon name="check-circle" size={19} color="#10b981" strokeWidth={2.4} />
                </View>
                <Text style={[styles.ruleText, { color: palette.text }]}>
                  {ruleText}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    // 5. Fallback: Key-Value presentation for arbitrary dictionary
    const entries = Object.entries(record);
    if (entries.length > 0) {
      return (
        <View style={styles.cardList}>
          {entries.map(([key, val], i) => (
            <View
              key={i}
              style={[
                styles.itemCard,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <Text style={styles.dictKeyEyebrow}>{key.replace(/_/g, ' ')}</Text>
              <Text style={[styles.dictValText, { color: palette.text }]}>
                {typeof val === 'string' ? val : JSON.stringify(val)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
  }

  return (
    <Text style={[styles.emptyText, { color: palette.mutedText }]}>
      No detailed content has been provided for this section yet.
    </Text>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: typography.headingFamily,
  },
  textContainer: {
    gap: 8,
  },
  lineSpacer: {
    height: 12,
  },
  h3Heading: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
    paddingTop: 14,
    paddingBottom: 4,
    fontFamily: typography.headingFamily,
  },
  h4Heading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    paddingTop: 10,
    paddingBottom: 3,
    fontFamily: typography.headingFamily,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingLeft: 2,
    marginVertical: 3,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ea580c',
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: -0.15,
    fontFamily: typography.headingFamily,
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingLeft: 2,
    marginVertical: 4,
  },
  numberedBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numberedBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  numberedText: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: -0.15,
    fontFamily: typography.headingFamily,
  },
  keyValueInlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginVertical: 3,
  },
  keyValueInlineKey: {
    fontSize: 16.5,
    fontWeight: '800',
    fontFamily: typography.headingFamily,
    lineHeight: 25,
  },
  keyValueInlineVal: {
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 25,
    fontFamily: typography.headingFamily,
  },
  bodyText: {
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: -0.15,
    fontFamily: typography.headingFamily,
  },
  cardList: {
    gap: 12,
  },
  itemCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  scheduleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    borderColor: 'rgba(234, 88, 12, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  scheduleBadgeText: {
    color: '#ea580c',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: typography.headingFamily,
  },
  scheduleCopy: {
    gap: 5,
  },
  itemCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    fontFamily: typography.headingFamily,
  },
  itemCardDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: typography.headingFamily,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  faqQBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  faqQBadgeText: {
    color: '#ea580c',
    fontSize: 12.5,
    fontWeight: '900',
    fontFamily: typography.headingFamily,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    fontFamily: typography.headingFamily,
    lineHeight: 24,
  },
  faqAnswerContainer: {
    paddingLeft: 35,
  },
  faqAnswerText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    fontFamily: typography.headingFamily,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 14,
  },
  ruleIconBox: {
    marginTop: 1.5,
  },
  ruleText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 23,
    letterSpacing: -0.1,
    fontFamily: typography.headingFamily,
  },
  dictKeyEyebrow: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: typography.headingFamily,
  },
  dictValText: {
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 23,
    fontFamily: typography.headingFamily,
  },
});
