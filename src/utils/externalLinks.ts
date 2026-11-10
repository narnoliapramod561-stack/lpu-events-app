import { Alert, Linking } from 'react-native';

export function normalizeExternalUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let trimmed = raw.trim();
  if (!trimmed) return null;

  // Block malicious schemes and control characters
  if (
    /^javascript:/i.test(trimmed) ||
    /^data:/i.test(trimmed) ||
    /^vbscript:/i.test(trimmed) ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return null;
  }

  // Prepend https:// if no protocol is present
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    trimmed = `https://${trimmed.replace(/^\/+/, '')}`;
  }

  return trimmed;
}

export function isSafeExternalUrl(value: unknown): value is string {
  const normalized = normalizeExternalUrl(value);
  if (!normalized) return false;
  try {
    const url = new URL(normalized);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
  } catch {
    // Resilient fallback for Hermes/React Native environments:
    // Ensure protocol is http/https and there is at least a valid domain structure
    return /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/i.test(normalized);
  }
}

export async function openExternalUrl(url: string, label: string): Promise<boolean> {
  const target = normalizeExternalUrl(url);
  if (!target || !isSafeExternalUrl(target)) {
    Alert.alert('Unable to open link', `The ${label} link is not valid.`);
    return false;
  }
  try {
    // Call Linking.openURL directly without canOpenURL gating.
    // On Android 11+ (API 30+), canOpenURL returns false for http/https URLs without package visibility queries,
    // which wrongly blocked valid browser links.
    await Linking.openURL(target);
    return true;
  } catch {
    Alert.alert('Unable to open link', `The ${label} link could not be opened.`);
    return false;
  }
}

export async function openMailtoUrl(address: string, subject: string, body = ''): Promise<boolean> {
  const url = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    if (!(await Linking.canOpenURL(url))) {
      Alert.alert('Unable to open email', 'No email app is available on this device.');
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert('Unable to open email', 'The email app could not be opened.');
    return false;
  }
}
