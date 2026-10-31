import { Alert, Linking } from 'react-native';

export function isSafeExternalUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string, label: string): Promise<boolean> {
  if (!isSafeExternalUrl(url)) {
    Alert.alert('Unable to open link', `The ${label} link is not valid.`);
    return false;
  }
  try {
    if (!(await Linking.canOpenURL(url))) {
      Alert.alert('Unable to open link', `No app is available to open this ${label} link.`);
      return false;
    }
    await Linking.openURL(url);
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
