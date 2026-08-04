import Constants, { ExecutionEnvironment } from 'expo-constants';
import { LogBox, Platform } from 'react-native';

import { MUEZZIN_OPTIONS, getMuezzinOption, type MuezzinId } from '@/lib/muezzin';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Notification permission, as the UI needs to see it.
 *
 * `undetermined` matters: the OS dialog only appears once per install, so a
 * screen has to know whether pressing "Allow" will actually prompt or silently
 * resolve to the answer given months ago. `unsupported` covers web — the step
 * degrades to a hint rather than a dead button.
 */
export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

/**
 * What SDK 53 removed from Expo Go is Android **push** — the remote-token half
 * of `expo-notifications`. Importing the module there logs loudly about it (see
 * {@link silenceExpoGoPushNoise}) but does not throw, and scheduling local
 * notifications works on both platforms, so reminders are testable in Expo Go.
 * Only the custom adhan sound is not; see below.
 */
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Whether this platform can post notifications at all. Web is the only exclusion
 * — `scheduleNotificationAsync` there depends on a service worker this app does
 * not ship.
 */
export const NOTIFICATIONS_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * The bundled adhan sounds are copied into the native project by the
 * expo-notifications config plugin, which Expo Go does not run. Asking for a
 * sound that is not there gets the default alert, so the UI has to say so
 * rather than leave the user wondering why they hear a chime.
 */
export const CUSTOM_SOUNDS_SUPPORTED = NOTIFICATIONS_SUPPORTED && !IS_EXPO_GO;

let notificationsModule: NotificationsModule | null = null;

/**
 * Importing `expo-notifications` in Expo Go on Android logs a red-box
 * `console.error` about push notifications having been removed. It comes from
 * `DevicePushTokenAutoRegistration.fx`, which registers a push-token listener at
 * module scope, so it fires on `require()` alone — this app never asks for a
 * push token, and local reminders are unaffected.
 *
 * `LogBox.ignoreLogs` only hides the in-app overlay; the same messages still
 * reach the Metro terminal through `console.error` / `console.warn`, so those
 * are filtered too. The two patterns are matched narrowly, and only in Expo Go,
 * so a genuine notification error still surfaces.
 */
const EXPO_GO_PUSH_NOISE = [
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
];

let noiseSilenced = false;

function silenceExpoGoPushNoise() {
  if (!__DEV__ || !IS_EXPO_GO || noiseSilenced) return;
  noiseSilenced = true;

  LogBox.ignoreLogs(EXPO_GO_PUSH_NOISE);

  for (const method of ['error', 'warn'] as const) {
    const original = console[method];
    console[method] = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === 'string' && EXPO_GO_PUSH_NOISE.some((p) => first.includes(p))) {
        return;
      }
      original(...args);
    };
  }
}

/** Loaded lazily so that web, where the module is useless, never pays for it. */
export function loadNotifications(): NotificationsModule {
  if (!notificationsModule) {
    silenceExpoGoPushNoise();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
  }
  return notificationsModule;
}

/**
 * Android needs a channel before any notification can be posted, and creating it
 * up front means the OS prompt and the eventual reminders agree on importance
 * and sound. Creating a channel that already exists is a no-op.
 *
 * A channel's sound is fixed the moment it is created — later calls change the
 * name but never the sound — so each recitation gets its own channel and
 * {@link ensurePrayerChannel} switches between them. `prayer-reminders` itself
 * is the default-alert channel, used when the muezzin is `none`.
 */
export const PRAYER_CHANNEL_ID = 'prayer-reminders';

function channelIdFor(muezzin: MuezzinId): string {
  const sound = getMuezzinOption(muezzin).notificationSound;
  return sound && CUSTOM_SOUNDS_SUPPORTED ? `${PRAYER_CHANNEL_ID}-${muezzin}` : PRAYER_CHANNEL_ID;
}

async function ensureAndroidChannel(name: string) {
  if (Platform.OS !== 'android') return;

  const Notifications = loadNotifications();
  await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

/**
 * Create the channel the chosen recitation plays on, and delete the ones for
 * every other recitation — Android lists every channel an app has ever created
 * in its system settings, and five near-identical "Prayer reminders" rows is
 * not a settings screen anyone can use.
 *
 * Returns the channel id to attach to the trigger, or `undefined` off Android.
 */
export async function ensurePrayerChannel(
  muezzin: MuezzinId,
  name: string
): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;

  const Notifications = loadNotifications();
  const wanted = channelIdFor(muezzin);

  await ensureAndroidChannel(name);

  if (wanted !== PRAYER_CHANNEL_ID) {
    await Notifications.setNotificationChannelAsync(wanted, {
      name,
      importance: Notifications.AndroidImportance.HIGH,
      sound: getMuezzinOption(muezzin).notificationSound,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Promise.all(
    MUEZZIN_OPTIONS.filter((option) => option.id !== muezzin && option.notificationSound).map(
      (option) =>
        Notifications.deleteNotificationChannelAsync(`${PRAYER_CHANNEL_ID}-${option.id}`).catch(
          () => {}
        )
    )
  );

  return wanted;
}

/** Current permission, without showing a prompt. */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!NOTIFICATIONS_SUPPORTED) return 'unsupported';

  const { granted, canAskAgain } = await loadNotifications().getPermissionsAsync();
  if (granted) return 'granted';
  return canAskAgain ? 'undetermined' : 'denied';
}

/**
 * Ask for permission to post prayer reminders.
 *
 * The OS only shows its dialog once per install; afterwards `canAskAgain` is
 * false and this resolves to whatever the user decided the first time, with no
 * prompt. That is why the caller must treat `denied` as a state to explain
 * rather than an error to retry.
 *
 * The reminders themselves are scheduled in `lib/prayer-notifications.ts`,
 * which re-checks this permission on every sync.
 */
export async function requestNotificationPermission(
  channelName: string
): Promise<NotificationPermission> {
  if (!NOTIFICATIONS_SUPPORTED) return 'unsupported';

  await ensureAndroidChannel(channelName);

  const { granted } = await loadNotifications().requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: true },
  });

  return granted ? 'granted' : 'denied';
}
