import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useSettings } from '@/components/settings';
import { getMuezzinOption } from '@/lib/muezzin';
import { NOTIFICATIONS_SUPPORTED, loadNotifications } from '@/lib/notifications';
import {
  PRAYER_NOTIFICATION_TYPE,
  syncPrayerNotifications,
  type PrayerNotificationConfig,
} from '@/lib/prayer-notifications';

/**
 * Keeps the OS's pending prayer reminders in step with settings, and plays the
 * adhan in full when one arrives with the app open.
 *
 * Mounted once, in the root layout. Everything it touches is either a no-op or
 * gated off where notifications are unsupported (web, Expo Go on Android), so
 * there is no second variant of this file.
 */
export function usePrayerNotifications() {
  const { settings, isLoading } = useSettings();

  const config: PrayerNotificationConfig = {
    enabled: settings.notificationsEnabled,
    coords: settings.coords,
    method: settings.method,
    madhab: settings.madhab,
    muezzin: settings.muezzin,
    language: settings.language,
    use24Hour: settings.use24Hour,
    locationName: settings.locationName,
  };

  // A ref, not a dependency: the handler and the listener are registered once,
  // and re-reading the ref keeps them honest as the recitation changes.
  const muezzinRef = useRef(settings.muezzin);
  useEffect(() => {
    muezzinRef.current = settings.muezzin;
  }, [settings.muezzin]);

  const playerRef = useRef<AudioPlayer | null>(null);

  // Reschedule on change, and again whenever the app comes back to the
  // foreground — that is what walks the seven-day window forward as days pass.
  useEffect(() => {
    // Scheduling against DEFAULT_SETTINGS before storage answers would put
    // Casablanca's prayer times on someone else's phone for a moment.
    if (isLoading || !settings.hasSetLocation) return;

    const sync = () => {
      syncPrayerNotifications(config).catch(() => {});
    };

    sync();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, settings.hasSetLocation, JSON.stringify(config)]);

  useEffect(() => {
    if (!NOTIFICATIONS_SUPPORTED) return;

    const Notifications = loadNotifications();

    /**
     * With the app open the OS alert sound is suppressed and the recitation is
     * played in full instead — a 28-second trimmed alert on top of the player
     * would be two adhans at once. `none` keeps the OS default alert, since
     * that user asked for no adhan, not for silence.
     */
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: getMuezzinOption(muezzinRef.current).source === null,
        shouldSetBadge: false,
      }),
    });

    const received = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.data?.type !== PRAYER_NOTIFICATION_TYPE) return;

      const source = getMuezzinOption(muezzinRef.current).source;
      if (!source) return;

      // The adhan should be audible with the ringer switched off.
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

      playerRef.current ??= createAudioPlayer(null);
      playerRef.current.replace(source);
      playerRef.current.seekTo(0);
      playerRef.current.play();
    });

    return () => {
      received.remove();
      playerRef.current?.release();
      playerRef.current = null;
    };
  }, []);
}
