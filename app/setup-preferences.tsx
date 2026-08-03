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
import { CALCULATION_METHODS, type CalculationMethodKey } from '@/lib/prayer-times';

const STEPS = ['language', 'method', 'muezzin'] as const;
type Step = (typeof STEPS)[number];

export default function SetupPreferencesScreen() {
  const { settings, updateSettings } = useSettings();
  const { t, rtl } = useTranslation();

  const [stepIndex, setStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const step: Step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  // Language applies immediately, so this screen re-labels itself as you pick.
  const chooseLanguage = (language: LanguageCode) => updateSettings({ language });
  const chooseMethod = (method: CalculationMethodKey) => updateSettings({ method });
  const chooseMuezzin = (muezzin: MuezzinId) => updateSettings({ muezzin });

  const TITLES: Record<Step, { title: StringKey; subtitle: StringKey }> = {
    language: { title: 'setup.languageTitle', subtitle: 'setup.languageSubtitle' },
    method: { title: 'setup.methodTitle', subtitle: 'setup.methodSubtitle' },
    muezzin: { title: 'setup.muezzinTitle', subtitle: 'setup.muezzinSubtitle' },
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
        ) : (
          <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
            {step === 'language'
              ? LANGUAGES.map((language, index) => (
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
              : CALCULATION_METHODS.map((method, index) => (
                  <ChoiceRow
                    key={method.key}
                    label={method.label}
                    selected={settings.method === method.key}
                    isLast={index === CALCULATION_METHODS.length - 1}
                    rtl={rtl}
                    onPress={() => chooseMethod(method.key)}
                  />
                ))}
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center gap-3 px-5 pb-6 pt-2">
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
          onPress={() => (isLastStep ? finish() : setStepIndex((index) => index + 1))}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-4 active:opacity-80">
          <Text className="text-base font-semibold text-white">
            {isLastStep ? t('setup.finish') : t('common.continue')}
          </Text>
          <MaterialCommunityIcons
            name={rtl ? 'arrow-left' : 'arrow-right'}
            size={18}
            color="#ffffff"
          />
        </Pressable>
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
