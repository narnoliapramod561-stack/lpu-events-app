import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { colors } from '../src/design/tokens';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { NativeErrorBoundary } from '../src/components/NativeErrorBoundary';
import { captureMobileException } from '../src/telemetry/mobileTelemetry';

// Global uncaught JavaScript exception handler for React Native thread
if (typeof (global as any).ErrorUtils !== 'undefined') {
  const originalHandler = (global as any).ErrorUtils.getGlobalHandler?.();
  (global as any).ErrorUtils.setGlobalHandler?.((error: any, isFatal?: boolean) => {
    captureMobileException(error, { isFatal, source: 'ErrorUtils.globalHandler' });
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

const StatusBar = ExpoStatusBar as React.ComponentType<
  React.ComponentProps<typeof ExpoStatusBar> & {
    translucent?: boolean;
    backgroundColor?: string;
  }
>;

function Navigation() {
  const { dark } = useTheme();
  const palette = dark ? colors.dark : colors.light;

  useEffect(() => {
    if (Platform.OS === 'android') {
      (RNStatusBar as any).setTranslucent?.(true);
      (RNStatusBar as any).setBackgroundColor?.('transparent');
    }
  }, []);

  return (
    <>
      <StatusBar
        style={dark ? 'light' : 'dark'}
        translucent={true}
        backgroundColor="transparent"
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  useFonts({
    'CormorantGaramond-BoldItalic': require('../assets/fonts/CormorantGaramond_700Bold_Italic.ttf'),
    'CormorantGaramond-SemiBoldItalic': require('../assets/fonts/CormorantGaramond_600SemiBold_Italic.ttf'),
  });

  return (
    <NativeErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </NativeErrorBoundary>
  );
}
