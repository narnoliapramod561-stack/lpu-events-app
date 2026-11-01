import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, glass, radii, shadows, spacing, typography } from '../design/tokens';
import { NativeIcon } from './NativeIcon';
import { LpuEventsLogo } from './LpuEventsLogo';
import { openMailtoUrl } from '../utils/externalLinks';
import { GlassSheen, SpecularTopRim } from './ui/NativeGlass';

type InfoPageKind = 'about' | 'contact' | 'privacy' | 'terms';

const content: Record<Exclude<InfoPageKind, 'contact'>, { eyebrow: string; title: string; paragraphs: string[]; sections: Array<[string, string]> }> = {
  about: {
    eyebrow: 'Official Student Discovery Hub',
    title: 'About LPU Events',
    paragraphs: ['LPU Events is the premier campus-wide discovery portal designed to unite students, student organizations, departments, and academic faculties across Lovely Professional University. From technical hackathons to cultural extravaganzas, we bring every happening on campus into one real-time, zero-friction destination.'],
    sections: [
      ['Unified Discovery', 'Every verified university event is categorized, searchable, and instantly accessible.'],
      ['Real-Time Campus Feed', "Find today’s schedule, venue details, guest speakers, and registration links in one place."],
      ['Privacy-First Architecture', 'Open campus browsing for students. No forced account creation, password storage, or sensitive student profiles.'],
      ['What We Showcase', 'Technical and coding events, cultural and arts programmes, workshops, seminars, entrepreneurship, sports, and student community activities.'],
    ],
  },
  privacy: {
    eyebrow: 'Privacy-First Architecture',
    title: 'Privacy Policy & Platform Transparency',
    paragraphs: [
      'Effective Date: January 1, 2026 • Last Updated: October 2026',
      'Welcome to LPU Events, accessible at https://lpuevents.live and via the mobile application. We prioritize student privacy with a zero-friction discovery experience.',
    ],
    sections: [
      [
        'Zero Advertising Policy',
        'LPU Events is completely ad-free. We do not use third-party advertising networks, behavioral ad trackers, or commercial profiling cookies. Your browsing and event discovery activity is never monetized.',
      ],
      [
        'Information We Handle',
        'The platform provides open public event discovery. It does not require student registration, password creation, or personal profiles. Essential technical data is strictly limited to performance caching, edge CDN reliability, and platform security.',
      ],
      [
        'Verified Campus Content',
        'All campus events are curated from verified university student organizations, academic departments, and authorized faculties. External registration links navigate directly to official organizer forms.',
      ],
      [
        'Contact & Inquiries',
        'For privacy inquiries, event listing feedback, or campus club listings, contact contact@lpuevents.live.',
      ],
    ],
  },
  terms: {
    eyebrow: 'Legal Agreement',
    title: 'Terms of Service & Organizer Responsibility Boundary',
    paragraphs: ['Effective Date: January 1, 2026 • Last Updated: August 2026', 'LPU Events operates strictly as an independent campus event discovery and information aggregation platform. Listing an event does not mean that LPU Events organizes, conducts, manages, guarantees, endorses, or controls that event.'],
    sections: [
      ['Acceptance and platform scope', 'By browsing the Platform, you agree to these Terms. LPU Events provides an open digital bulletin and discovery interface for extracurricular, academic, cultural, technical, and sports events.'],
      ['Organizer responsibility', 'The responsible organizer retains control and accountability for event accuracy, schedules, venues, eligibility, participation rules, fees, refunds, notifications, postponements, and cancellations.'],
      ['Limitation of liability', 'LPU Events is not responsible for event cancellations, venue changes, inaccurate information, organizer conduct, event quality, prizes, registration, or disputes arising from an event.'],
      ['External registration', 'Registration links and payments are handled by the respective organizer or external provider. Review their terms before registering.'],
    ],
  },
};

export function InfoPage({ kind, dark }: { kind: InfoPageKind; dark: boolean }) {
  const palette = dark ? colors.dark : colors.light;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const openMail = (target: string, subject: string, body = '') => openMailtoUrl(target, subject, body);

  if (kind === 'contact') {
    return (
      <PageShell dark={dark} title="Support & Inquiries">
        <Header dark={dark} eyebrow="Official Contact Channel" title="Contact LPU Events Team" description="We’re here to assist students, organizers, and campus clubs." />
        <Card dark={dark}>
          <Text style={[styles.body, { color: palette.mutedText }]}>
            Have questions about an upcoming event, need technical support, want to feature your student club event, or report an inaccurate listing? Reach out directly through our verified campus channel.
          </Text>
          {[
            ['General Support & Club Event Listings', 'contact@lpuevents.live'],
          ].map(([label, address]) => <Pressable key={address} style={styles.contactRow} onPress={() => openMail(address, 'LPU Events inquiry')}><Text style={[styles.caption, { color: palette.mutedText }]}>{label}</Text><Text style={[styles.link, { color: palette.primary }]}>{address}</Text></Pressable>)}
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Send a message</Text>
          {submitted ? <Text style={[styles.body, { color: '#16a34a' }]}>Your message has been prepared in your mail client.</Text> : <>
            <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={palette.mutedText} style={[styles.input, { color: palette.text, borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', borderWidth: 1.5 }]} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" placeholderTextColor={palette.mutedText} style={[styles.input, { color: palette.text, borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', borderWidth: 1.5 }]} />
            <TextInput value={message} onChangeText={setMessage} placeholder="Message" multiline placeholderTextColor={palette.mutedText} style={[styles.input, styles.message, { color: palette.text, borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', borderWidth: 1.5 }]} />
            <Pressable style={[styles.button, { backgroundColor: palette.primary, overflow: 'hidden' }]} onPress={() => { if (!name.trim() || !email.trim() || !message.trim()) return; void openMail('contact@lpuevents.live', `[LPU Events Inquiry] from ${name}`, `Name: ${name}\nEmail: ${email}\n\n${message}`).then((opened) => { if (opened) setSubmitted(true); }); }}>
              <SpecularTopRim dark={dark} height={1} />
              <Text style={styles.buttonText}>Prepare Email</Text>
            </Pressable>
          </>}
        </Card>
      </PageShell>
    );
  }

  const page = content[kind];
  return <PageShell dark={dark} title={page.eyebrow}><Header dark={dark} eyebrow={page.eyebrow} title={page.title} description={page.paragraphs[0]} />{page.paragraphs.slice(1).map((text) => <Card key={text} dark={dark}><Text style={[styles.body, { color: palette.mutedText }]}>{text}</Text></Card>)}{page.sections.map(([title, text]) => <Card key={title} dark={dark}><Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text><Text style={[styles.body, { color: palette.mutedText }]}>{text}</Text></Card>)}</PageShell>;
}

function PageShell({ dark, title, children }: { dark: boolean; title: string; children: React.ReactNode }) {
  const palette = dark ? colors.dark : colors.light;
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/'); };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ImageBackground
        source={require('../../assets/lpu-events-campus-glass-background.webp')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? 'rgba(14,14,18,0.65)' : 'rgba(244,247,251,0.06)' },
          ]}
        />
      </ImageBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topbar}>
          <Pressable
            onPress={goBack}
            style={[
              styles.back,
              {
                backgroundColor: dark ? glass.dark.pillBg : glass.light.pillBg,
                borderColor: dark ? glass.dark.pillBorder : glass.light.pillBorder,
                borderWidth: 1.5,
              },
            ]}
          >
            <SpecularTopRim dark={dark} height={1} />
            <NativeIcon name="arrow-left" size={17} color={palette.text} />
            <Text style={[styles.backText, { color: palette.text }]}>Back to Events</Text>
          </Pressable>
          <Text style={[styles.eyebrow, { color: palette.mutedText }]}>{title}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ dark, eyebrow, title, description }: { dark: boolean; eyebrow: string; title: string; description: string }) {
  const palette = dark ? colors.dark : colors.light;
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: dark ? glass.dark.panelBg : glass.light.panelBg,
          borderColor: dark ? glass.dark.border : glass.light.border,
          borderWidth: 1.5,
        },
      ]}
    >
      <SpecularTopRim dark={dark} height={1.5} />
      <GlassSheen dark={dark} />
      <LpuEventsLogo size={54} />
      <Text style={[styles.eyebrow, { color: palette.primary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.body, { color: palette.mutedText }]}>{description}</Text>
    </View>
  );
}

function Card({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? glass.dark.panelBg : glass.light.panelBg,
          borderColor: dark ? glass.dark.border : glass.light.border,
          borderWidth: 1.5,
        },
      ]}
    >
      <SpecularTopRim dark={dark} height={1.5} />
      <GlassSheen dark={dark} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xxl, gap: spacing.md },
  topbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radii.pill, overflow: 'hidden', position: 'relative' },
  backText: { fontFamily: typography.fontFamily, fontWeight: '800', fontSize: 13 },
  eyebrow: { fontFamily: typography.headingFamily, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  header: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xs, overflow: 'hidden', position: 'relative', ...shadows.glass },
  title: { fontFamily: typography.headingFamily, fontSize: 28, lineHeight: 34, fontWeight: '900' },
  card: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, overflow: 'hidden', position: 'relative', ...shadows.glass },
  sectionTitle: { fontFamily: typography.headingFamily, fontSize: 17, fontWeight: '900' },
  body: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 22 },
  caption: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  link: { fontSize: 14, fontWeight: '800' },
  contactRow: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(148,163,184,0.22)' },
  input: { minHeight: 44, borderRadius: radii.sm, paddingHorizontal: spacing.md, fontSize: 14 },
  message: { minHeight: 110, paddingTop: spacing.md, textAlignVertical: 'top' },
  button: { minHeight: 46, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs, position: 'relative' },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
