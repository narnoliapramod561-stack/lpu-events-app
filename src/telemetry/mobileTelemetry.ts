import { Platform } from 'react-native';
import Constants from 'expo-constants';

const POSTHOG_API_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_KEY ||
  (Constants.expoConfig?.extra as any)?.posthogKey ||
  '';

const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ||
  (Constants.expoConfig?.extra as any)?.posthogHost ||
  'https://us.i.posthog.com';

const appVersion = Constants.expoConfig?.version || '1.0.0';

/**
 * Lightweight, zero-dependency exception reporting for React Native / Expo.
 * Directly posts to PostHog /capture/ endpoint without blocking UI thread.
 */
export function captureMobileException(
  error: unknown,
  context: Record<string, any> = {}
): void {
  const err = error instanceof Error ? error : new Error(String(error || 'Unknown mobile error'));
  console.error('[MobileTelemetry:Error]', err, context);

  if (!POSTHOG_API_KEY || POSTHOG_API_KEY.trim() === '' || POSTHOG_API_KEY === 'placeholder') {
    return;
  }

  const payload = {
    api_key: POSTHOG_API_KEY,
    event: '$exception',
    distinct_id: 'mobile-app-client',
    timestamp: new Date().toISOString(),
    properties: {
      app: 'mobile',
      platform: Platform.OS,
      os_version: Platform.Version,
      app_version: appVersion,
      $exception_type: err.name || 'Error',
      $exception_message: err.message || 'Unknown mobile exception',
      $exception_stack_trace_raw: err.stack,
      ...context,
    },
  };

  try {
    fetch(`${POSTHOG_HOST.replace(/\/$/, '')}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Non-blocking catch
    });
  } catch {
    // Non-blocking catch
  }
}

