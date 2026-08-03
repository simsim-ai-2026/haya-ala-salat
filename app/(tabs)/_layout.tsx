import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { useSettings } from '@/components/settings';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const { settings, isLoading } = useSettings();
  const { t } = useTranslation();

  // Onboarding gates, in order. Both redirects happen behind the splash overlay,
  // so first-run users never see the tabs flash before being sent onward.
  if (!isLoading && !settings.hasSetLocation) {
    return <Redirect href="/location-setup" />;
  }
  if (!isLoading && !settings.hasCompletedSetup) {
    return <Redirect href="/setup-preferences" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.prayerTimes'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
