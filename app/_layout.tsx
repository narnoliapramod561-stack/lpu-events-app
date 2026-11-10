import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { colors } from '../src/design/tokens';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

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
    <ThemeProvider>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
