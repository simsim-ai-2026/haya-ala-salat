import "../global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import "react-native-reanimated";

import { BrandedSplash } from "@/components/branded-splash";
import { SettingsProvider, useSettings } from "@/components/settings";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Hold the native splash until <BrandedSplash /> is on screen to take over.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 300 });

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootNavigator />
    </SettingsProvider>
  );
}

/** Split out so it can read the settings context that RootLayout provides. */
function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isLoading } = useSettings();
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Onboarding steps: nothing behind them to go back to on first run. */}
        <Stack.Screen
          name="location-setup"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="setup-preferences"
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack>
      {/* The splash is dark regardless of the system theme. */}
      <StatusBar style={isSplashDone ? "auto" : "light"} />
      <BrandedSplash
        isAppReady={!isLoading}
        onFinish={() => setIsSplashDone(true)}
      />
    </ThemeProvider>
  );
}
