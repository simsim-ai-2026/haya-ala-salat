import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MuezzinPicker } from '@/components/muezzin-picker';
import { useSettings } from '@/components/settings';
import { useTranslation } from '@/hooks/use-translation';
import { LANGUAGES, type LanguageCode, type StringKey } from '@/lib/i18n';
import type { MuezzinId } from '@/lib/muezzin';
import {
  getNotificationPermission,
  requestNotificationPermission,
  type NotificationPermission,
} from '@/lib/notifications';
import { CALCULATION_METHODS, formatTime, type CalculationMethodKey } from '@/lib/prayer-times';

const STEPS = ['language', 'method', 'notifications', 'muezzin', 'clock'] as const;
type Step = (typeof STEPS)[number];

/** Arbitrary evening time, only ever shown as a preview of the two clock formats. */
const CLOCK_SAMPLE = new Date(2024, 0, 1, 18, 42);

const CLOCK_OPTIONS: { use24Hour: boolean; label: StringKey }[] = [
  { use24Hour: true, label: 'setup.clock24' },
  { use24Hour: false, label: 'setup.clock12' },
];

const PERMISSION_MESSAGES: Partial<Record<NotificationPermission, StringKey>> = {
  granted: 'setup.notificationsGranted',
  denied: 'setup.notificationsDenied',
  unsupported: 'setup.notificationsUnsupported',
};

export default function SetupPreferencesScreen() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, rtl } = useTranslation();

  const [stepIndex, setStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const step: Step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  // Language applies immediately, so this screen re-labels itself as you pick.
  const chooseLanguage = (language: LanguageCode) => updateSettings({ language });
  const chooseMethod = (method: CalculationMethodKey) => updateSettings({ method });
  const chooseMuezzin = (muezzin: MuezzinId) => updateSettings({ muezzin });
  const chooseClock = (use24Hour: boolean) => updateSettings({ use24Hour });

  const TITLES: Record<Step, { title: StringKey; subtitle: StringKey }> = {
    language: { title: 'setup.languageTitle', subtitle: 'setup.languageSubtitle' },
    method: { title: 'setup.methodTitle', subtitle: 'setup.methodSubtitle' },
    notifications: {
      title: 'setup.notificationsTitle',
      subtitle: 'setup.notificationsSubtitle',
    },
    muezzin: { title: 'setup.muezzinTitle', subtitle: 'setup.muezzinSubtitle' },
    clock: { title: 'setup.clockTitle', subtitle: 'setup.clockSubtitle' },
  };

  // Read the existing permission before offering a button: the OS dialog only
  // ever appears once, so on a reinstall-less second run "Allow" would resolve
  // silently to the old answer and look broken.
  useEffect(() => {
    if (step !== 'notifications' || permission !== null) return;

    let cancelled = false;
    getNotificationPermission().then((current) => {
      if (!cancelled) setPermission(current);
    });

    return () => {
      cancelled = true;
    };
  }, [step, permission]);

  // Offer "Allow" only while the OS would actually show its dialog. Once the
  // answer is known — granted, refused, or web — the step explains it and the
  // footer goes back to being a plain Continue.
  const showAllowButton =
    step === 'notifications' && (permission === null || permission === 'undetermined');
  const permissionMessage =
    step === 'notifications' && permission ? PERMISSION_MESSAGES[permission] : undefined;

  const askForNotifications = async () => {
    setIsAsking(true);
    try {
      const result = await requestNotificationPermission(t('setup.notificationsTitle'));
      setPermission(result);
      updateSettings({ notificationsEnabled: result === 'granted' });
    } finally {
      setIsAsking(false);
    }
  };

  const goNext = () => setStepIndex((index) => index + 1);

  const skipNotifications = () => {
    updateSettings({ notificationsEnabled: false });
    goNext();
  };

  const finish = () => {
    updateSettings({ hasCompletedSetup: true });
    setIsFinished(true);
  };

  // Same reason as location-setup: leave only once the flag is in context, or the
  // tab layout's redirect races us and sends the user straight back here.
  useEffect(() => {
    if (isFinished && settings.hasCompletedSetup) router.replace('/');
  }, [isFinished, settings.hasCompletedSetup]);

  return (
    <SafeAreaView className="flex-1 bg-sand-50 dark:bg-emerald-900" edges={['top']}>
      <View className="px-5 pb-4 pt-2">
        <Text
          className="text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-sand-200/70"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {t('setup.step', { current: stepIndex + 1, total: STEPS.length })}
        </Text>
        <Text
          className="mt-2 text-2xl font-bold text-emerald-800 dark:text-sand-50"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {t(TITLES[step].title)}
        </Text>
        <Text
          className="mt-1 text-sm text-emerald-700/80 dark:text-sand-200/80"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {t(TITLES[step].subtitle)}
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-4">
        {step === 'muezzin' ? (
          <MuezzinPicker selected={settings.muezzin} onSelect={chooseMuezzin} />
        ) : step === 'notifications' ? (
          <View className="rounded-2xl bg-white p-5 dark:bg-emerald-800">
            <View className={`items-center gap-3 ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-emerald-700/10 dark:bg-emerald-700/40">
                <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#0f766e" />
              </View>
              <Text
                className="flex-1 text-sm leading-5 text-emerald-800 dark:text-sand-100"
                style={{ textAlign: rtl ? 'right' : 'left' }}>
                {t('setup.notificationsBody')}
              </Text>
            </View>

            {permissionMessage ? (
              <Text
                className="mt-4 border-t border-sand-100 pt-4 text-sm text-emerald-700/80 dark:border-emerald-700 dark:text-sand-200/80"
                style={{ textAlign: rtl ? 'right' : 'left' }}>
                {t(permissionMessage)}
              </Text>
            ) : null}
          </View>
        ) : (
          <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
            {step === 'language' ? (
              LANGUAGES.map((language, index) => (
                <ChoiceRow
                  key={language.code}
                  label={language.native}
                  hint={language.native === language.label ? undefined : language.label}
                  selected={settings.language === language.code}
                  isLast={index === LANGUAGES.length - 1}
                  rtl={rtl}
                  onPress={() => chooseLanguage(language.code)}
                />
              ))
            ) : step === 'method' ? (
              CALCULATION_METHODS.map((method, index) => (
                <ChoiceRow
                  key={method.key}
                  label={method.label}
                  selected={settings.method === method.key}
                  isLast={index === CALCULATION_METHODS.length - 1}
                  rtl={rtl}
                  onPress={() => chooseMethod(method.key)}
                />
              ))
            ) : (
              CLOCK_OPTIONS.map((option, index) => (
                <ChoiceRow
                  key={option.label}
                  label={t(option.label)}
                  hint={formatTime(CLOCK_SAMPLE, option.use24Hour, locale)}
                  selected={settings.use24Hour === option.use24Hour}
                  isLast={index === CLOCK_OPTIONS.length - 1}
                  rtl={rtl}
                  onPress={() => chooseClock(option.use24Hour)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View className="px-5 pb-6 pt-2">
        <View className="flex-row items-center gap-3">
          {stepIndex > 0 ? (
            <Pressable
              onPress={() => setStepIndex((index) => index - 1)}
              className="items-center rounded-2xl border border-emerald-700/30 px-6 py-4 active:opacity-70">
              <Text className="text-base font-medium text-emerald-700 dark:text-sand-200">
                {t('common.back')}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={
              showAllowButton ? askForNotifications : isLastStep ? finish : goNext
            }
            disabled={isAsking}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-4 active:opacity-80 disabled:opacity-60">
            <Text className="text-base font-semibold text-white">
              {isAsking
                ? t('setup.notificationsAsking')
                : showAllowButton
                  ? t('setup.notificationsAllow')
                  : isLastStep
                    ? t('setup.finish')
                    : t('common.continue')}
            </Text>
            <MaterialCommunityIcons
              name={showAllowButton ? 'bell-ring-outline' : rtl ? 'arrow-left' : 'arrow-right'}
              size={18}
              color="#ffffff"
            />
          </Pressable>
        </View>

        {showAllowButton ? (
          <Pressable
            onPress={skipNotifications}
            disabled={isAsking}
            className="mt-3 items-center py-2 active:opacity-60">
            <Text className="text-sm font-medium text-emerald-700/80 dark:text-sand-200/80">
              {t('setup.notificationsSkip')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function ChoiceRow({
  label,
  hint,
  selected,
  isLast,
  rtl,
  onPress,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  isLast: boolean;
  rtl: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`items-center px-5 py-4 active:opacity-60 ${
        rtl ? 'flex-row-reverse' : 'flex-row'
      } ${isLast ? '' : 'border-b border-sand-100 dark:border-emerald-700'}`}>
      <View className="flex-1 px-3">
        <Text
          className="text-base text-emerald-900 dark:text-sand-50"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {label}
        </Text>
        {hint ? (
          <Text
            className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70"
            style={{ textAlign: rtl ? 'right' : 'left' }}>
            {hint}
          </Text>
        ) : null}
      </View>
      {selected ? <MaterialCommunityIcons name="check" size={20} color="#0f766e" /> : null}
    </Pressable>
  );
}
