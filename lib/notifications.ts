import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Notification permission, as the UI needs to see it.
 *
 * `undetermined` matters: the OS dialog only appears once per install, so a
 * screen has to know whether pressing "Allow" will actually prompt or silently
 * resolve to the answer given months ago. `unsupported` covers web and Expo Go
 * on Android — the step degrades to a hint rather than a dead button.
 */
export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

/**
 * SDK 53 removed Android push support from Expo Go, and `expo-notifications`
 * reports that as a hard error the moment it is imported — before any of our
 * code runs, and regardless of whether we only ever wanted local notifications.
 * So the import has to be lazy and gated, not merely unused.
 *
 * iOS Expo Go only warns, and any development or store build is fully
 * supported, so this is narrowly one platform-plus-runtime combination.
 */
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const SUPPORTED = Platform.OS === 'ios' || (Platform.OS === 'android' && !IS_EXPO_GO);

let notificationsModule: NotificationsModule | null = null;

function loadNotifications(): NotificationsModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  notificationsModule ??= require('expo-notifications') as NotificationsModule;
  return notificationsModule;
}

/**
 * Android needs a channel before any notification can be posted, and creating it
 * up front means the OS prompt and the eventual reminders agree on importance
 * and sound. Creating a channel that already exists is a no-op.
 */
export const PRAYER_CHANNEL_ID = 'prayer-reminders';

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

/** Current permission, without showing a prompt. */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!SUPPORTED) return 'unsupported';

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
 * Nothing is scheduled yet — see `lib/muezzin.ts`. This records consent so the
 * scheduling work can use it without asking the user again.
 */
export async function requestNotificationPermission(
  channelName: string
): Promise<NotificationPermission> {
  if (!SUPPORTED) return 'unsupported';

  await ensureAndroidChannel(channelName);

  const { granted } = await loadNotifications().requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: true },
  });

  return granted ? 'granted' : 'denied';
}
