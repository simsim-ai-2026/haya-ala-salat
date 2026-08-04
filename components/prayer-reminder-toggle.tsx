import { useEffect, useState } from 'react';
import { Linking, Pressable, Switch, Text, View } from 'react-native';

import { useSettings } from '@/components/settings';
import { useTranslation } from '@/hooks/use-translation';
import type { StringKey } from '@/lib/i18n';
import {
  CUSTOM_SOUNDS_SUPPORTED,
  getNotificationPermission,
  requestNotificationPermission,
  type NotificationPermission,
} from '@/lib/notifications';

/**
 * Turns prayer reminders on and off.
 *
 * The switch reflects the *stored intent*; the OS permission is read alongside
 * it, because the two drift — a user can revoke notifications in system
 * settings without the app hearing about it. When they disagree, the permission
 * wins and the row says why, rather than showing a switch that is on and does
 * nothing.
 */
export function PrayerReminderToggle() {
  const { settings, updateSettings } = useSettings();
  const { t, rtl } = useTranslation();

  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Re-read on focus is deliberately not done: the user has to leave the app to
  // change this, and the switch corrects itself on the next mount.
  useEffect(() => {
    let cancelled = false;
    getNotificationPermission().then((current) => {
      if (!cancelled) setPermission(current);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const blocked = permission === 'denied';
  const unsupported = permission === 'unsupported';
  const isOn = settings.notificationsEnabled && !blocked && !unsupported;

  const toggle = async (next: boolean) => {
    if (!next) {
      updateSettings({ notificationsEnabled: false });
      return;
    }

    // Asking while `undetermined` shows the OS dialog; once answered it resolves
    // silently to that answer, which is why `denied` offers device settings instead.
    setIsAsking(true);
    try {
      const result = await requestNotificationPermission(t('setup.notificationsTitle'));
      setPermission(result);
      updateSettings({ notificationsEnabled: result === 'granted' });
    } finally {
      setIsAsking(false);
    }
  };

  const hint: StringKey = unsupported
    ? 'settings.notificationsUnsupported'
    : blocked
      ? 'settings.notificationsDenied'
      : !isOn
        ? 'settings.notificationsHint'
        : settings.muezzin !== 'none' && CUSTOM_SOUNDS_SUPPORTED
          ? 'settings.notificationsSound'
          : 'settings.notificationsSilent';

  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };

  return (
    <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
      <View
        className={`items-center justify-between px-5 py-4 ${
          rtl ? 'flex-row-reverse' : 'flex-row'
        }`}>
        <View className="flex-1 pe-3">
          <Text className="text-base text-emerald-900 dark:text-sand-50" style={align}>
            {t('settings.notifications')}
          </Text>
          <Text
            className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70"
            style={align}>
            {t(hint)}
          </Text>
        </View>
        <Switch
          value={isOn}
          disabled={isAsking || unsupported}
          onValueChange={toggle}
          trackColor={{ true: '#0f766e', false: '#cbd5e1' }}
        />
      </View>

      {blocked ? (
        <Pressable
          onPress={() => Linking.openSettings()}
          accessibilityRole="button"
          className="border-t border-sand-100 px-5 py-4 active:opacity-60 dark:border-emerald-700">
          <Text className="text-sm font-medium text-emerald-700 dark:text-sand-200" style={align}>
            {t('settings.openSystemSettings')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
