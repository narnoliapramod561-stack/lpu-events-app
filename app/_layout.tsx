import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
