import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { colors } from '../src/design/tokens';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function Navigation() {
  const { dark } = useTheme();
  const palette = dark ? colors.dark : colors.light;

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
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
