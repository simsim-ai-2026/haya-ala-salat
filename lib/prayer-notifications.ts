import { LOCALES, translate, type LanguageCode } from '@/lib/i18n';
import { getMuezzinOption, type MuezzinId } from '@/lib/muezzin';
import {
  CUSTOM_SOUNDS_SUPPORTED,
  NOTIFICATIONS_SUPPORTED,
  ensurePrayerChannel,
  getNotificationPermission,
  loadNotifications,
} from '@/lib/notifications';
import {
  PRAYER_ORDER,
  formatTime,
  getPrayerTimes,
  type CalculationMethodKey,
  type Coords,
  type MadhabKey,
  type PrayerName,
} from '@/lib/prayer-times';

/**
 * There is no background task computing prayer times: every reminder is a local
 * notification handed to the OS ahead of time, which is what makes them fire
 * with the app closed. The window is bounded by iOS, which keeps only the 64
 * soonest pending notifications and silently drops the rest — five prayers over
 * seven days is 35, comfortably inside that, and refilled on every foreground.
 */
const DAYS_AHEAD = 7;

/** Sunrise is in `PRAYER_ORDER` for the schedule display, but no one prays it. */
const NOTIFIED_PRAYERS = PRAYER_ORDER.filter((name) => name !== 'sunrise');

/** Marks our own notifications, so the foreground handler can recognise them. */
export const PRAYER_NOTIFICATION_TYPE = 'prayer';

export type PrayerNotificationData = {
  type: typeof PRAYER_NOTIFICATION_TYPE;
  prayer: PrayerName;
};

export type PrayerNotificationConfig = {
  enabled: boolean;
  coords: Coords;
  method: CalculationMethodKey;
  madhab: MadhabKey;
  muezzin: MuezzinId;
  language: LanguageCode;
  use24Hour: boolean;
  locationName: string;
};

/** Every prayer time in the window that has not already passed. */
function upcomingPrayers(
  config: PrayerNotificationConfig,
  now: Date
): { name: PrayerName; time: Date }[] {
  const options = { method: config.method, madhab: config.madhab };
  const entries: { name: PrayerName; time: Date }[] = [];

  for (let day = 0; day < DAYS_AHEAD; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    const times = getPrayerTimes(config.coords, options, date);
    for (const name of NOTIFIED_PRAYERS) {
      const time = times[name];
      // A trigger in the past fires immediately on some Android builds, which
      // would greet the user with this morning's Fajr the moment they open the app.
      if (time.getTime() > now.getTime() + 1000) entries.push({ name, time });
    }
  }

  return entries.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/**
 * Rescheduling the same 35 notifications on every foreground is wasted work, so
 * a sync is skipped when nothing that shapes them has changed. The date is part
 * of the signature: a day passing is exactly when the window needs refilling.
 */
function signatureOf(config: PrayerNotificationConfig, now: Date): string {
  return JSON.stringify([config, now.toDateString()]);
}

/** The alert sound to attach, and the Android channel that can play it. */
async function resolveAlert(config: PrayerNotificationConfig) {
  const channelName = translate(config.language, 'setup.notificationsTitle');
  const channelId = await ensurePrayerChannel(config.muezzin, channelName);
  const soundFile = getMuezzinOption(config.muezzin).notificationSound;

  return {
    // Falls back to the device's default alert when the recitation is `none`,
    // and in Expo Go, where the plugin has not bundled the file at all.
    sound: soundFile && CUSTOM_SOUNDS_SUPPORTED ? soundFile : 'default',
    channelId,
  };
}

/** Title and body a reminder for `prayer` at `time` would carry. */
function contentFor(config: PrayerNotificationConfig, prayer: PrayerName, time: Date) {
  return {
    title: translate(config.language, 'notification.title', {
      prayer: translate(config.language, `prayer.${prayer}`),
    }),
    body: translate(config.language, 'notification.body', {
      time: formatTime(time, config.use24Hour, LOCALES[config.language]),
      location: config.locationName,
    }),
  };
}

let lastSignature: string | null = null;

/** Forget the last sync, so the next call reschedules unconditionally. */
export function invalidatePrayerNotifications() {
  lastSignature = null;
}

/**
 * Bring the OS's pending notifications in line with the current settings.
 *
 * Everything is cancelled and rebuilt rather than diffed — the whole schedule
 * moves whenever the location, method or madhab changes, and 35 notifications
 * is small enough that a diff would only be a way to get it subtly wrong.
 *
 * Returns how many are now pending, or `null` when the sync was skipped because
 * nothing had changed. 0 means reminders are off, unpermitted, or unsupported.
 */
export async function syncPrayerNotifications(
  config: PrayerNotificationConfig,
  now: Date = new Date()
): Promise<number | null> {
  if (!NOTIFICATIONS_SUPPORTED) return 0;

  const signature = signatureOf(config, now);
  if (signature === lastSignature) return null;

  const Notifications = loadNotifications();

  // The OS permission is the authority; the stored flag only records intent.
  const permitted = config.enabled && (await getNotificationPermission()) === 'granted';

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!permitted) {
    lastSignature = signature;
    return 0;
  }

  const { sound, channelId } = await resolveAlert(config);
  const entries = upcomingPrayers(config, now);

  await Promise.all(
    entries.map(({ name, time }) => {
      const data: PrayerNotificationData = { type: PRAYER_NOTIFICATION_TYPE, prayer: name };

      return Notifications.scheduleNotificationAsync({
        content: { ...contentFor(config, name, time), sound, data },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
          channelId,
        },
      });
    })
  );

  lastSignature = signature;
  return entries.length;
}

/** Drop every pending reminder — used when the user turns them off. */
export async function cancelPrayerNotifications() {
  if (!NOTIFICATIONS_SUPPORTED) return;

  await loadNotifications().cancelAllScheduledNotificationsAsync();
  invalidatePrayerNotifications();
}
