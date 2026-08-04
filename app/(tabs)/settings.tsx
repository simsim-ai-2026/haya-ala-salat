import { router } from "expo-router";
import type { ReactNode } from "react";
import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MuezzinPicker } from "@/components/muezzin-picker";
import { PrayerReminderToggle } from "@/components/prayer-reminder-toggle";
import { useSettings } from "@/components/settings";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGES } from "@/lib/i18n";
import { MUEZZIN_ATTRIBUTIONS } from "@/lib/muezzin";
import { CALCULATION_METHODS, type MadhabKey } from "@/lib/prayer-times";

const MADHABS = [
  { key: "shafi", label: "settings.madhab.shafi", hint: "settings.madhab.shafiHint" },
  { key: "hanafi", label: "settings.madhab.hanafi", hint: "settings.madhab.hanafiHint" },
] as const satisfies readonly { key: MadhabKey; label: string; hint: string }[];

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { t, rtl } = useTranslation();

  const align = { textAlign: rtl ? ("right" as const) : ("left" as const) };

  return (
    <SafeAreaView
      className="flex-1 bg-sand-50 dark:bg-emerald-900"
      edges={["top"]}
    >
      <ScrollView contentContainerClassName="px-5 pb-10">
        <Text
          className="pb-6 pt-4 text-3xl font-bold text-emerald-800 dark:text-sand-50"
          style={align}
        >
          {t("settings.title")}
        </Text>

        <Section title={t("settings.display")} rtl={rtl}>
          <View
            className={`items-center justify-between px-5 py-4 ${
              rtl ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <Text className="text-base text-emerald-900 dark:text-sand-50">
              {t("settings.use24Hour")}
            </Text>
            <Switch
              value={settings.use24Hour}
              onValueChange={(use24Hour) => updateSettings({ use24Hour })}
              trackColor={{ true: "#0f766e", false: "#cbd5e1" }}
            />
          </View>
        </Section>

        <Section title={t("settings.language")} rtl={rtl}>
          {LANGUAGES.map((language, index) => (
            <Row
              key={language.code}
              label={language.native}
              hint={
                language.native === language.label ? undefined : language.label
              }
              selected={settings.language === language.code}
              isLast={index === LANGUAGES.length - 1}
              rtl={rtl}
              onPress={() => updateSettings({ language: language.code })}
            />
          ))}
        </Section>

        <Section title={t("settings.notifications")} rtl={rtl} bare>
          <PrayerReminderToggle />
        </Section>

        <Section title={t("muezzin.title")} rtl={rtl} bare>
          <MuezzinPicker
            selected={settings.muezzin}
            onSelect={(muezzin) => updateSettings({ muezzin })}
          />
          {/* CC BY-SA requires the author, licence and a link to be shown. */}
          <Text
            className="mt-2 px-1 text-xs text-emerald-700/70 dark:text-sand-200/70"
            style={align}
          >
            {t("muezzin.credits")}
          </Text>
          {MUEZZIN_ATTRIBUTIONS.map((credit) => (
            <Pressable
              key={credit.sourceUrl}
              onPress={() => Linking.openURL(credit.sourceUrl)}
              className="mt-1 px-1 active:opacity-60"
              accessibilityRole="link"
            >
              <Text
                className="text-xs text-emerald-700/70 underline dark:text-sand-200/70"
                style={align}
              >
                “{credit.work}” — {credit.author} ({credit.license})
              </Text>
            </Pressable>
          ))}
        </Section>

        <Section title={t("settings.madhab")} rtl={rtl}>
          {MADHABS.map((madhab, index) => (
            <Row
              key={madhab.key}
              label={t(madhab.label)}
              hint={t(madhab.hint)}
              selected={settings.madhab === madhab.key}
              isLast={index === MADHABS.length - 1}
              rtl={rtl}
              onPress={() => updateSettings({ madhab: madhab.key })}
            />
          ))}
        </Section>

        <Section title={t("settings.method")} rtl={rtl}>
          {CALCULATION_METHODS.map((method, index) => (
            <Row
              key={method.key}
              label={method.label}
              selected={settings.method === method.key}
              isLast={index === CALCULATION_METHODS.length - 1}
              rtl={rtl}
              onPress={() => updateSettings({ method: method.key })}
            />
          ))}
        </Section>

        <Section title={t("settings.location")} rtl={rtl}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/location-setup",
                params: { edit: "1" },
              })
            }
            className={`items-center justify-between px-5 py-4 active:opacity-60 ${
              rtl ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <View className="flex-1 px-3">
              <Text
                className="text-base text-emerald-900 dark:text-sand-50"
                style={align}
              >
                {settings.locationName}
              </Text>
              <Text
                className="mt-1 text-xs text-emerald-700/70 dark:text-sand-200/70"
                style={align}
              >
                {settings.coords.latitude.toFixed(4)},{" "}
                {settings.coords.longitude.toFixed(4)}
              </Text>
            </View>
            <IconSymbol
              name={rtl ? "chevron.left" : "chevron.right"}
              size={18}
              color="#0f766e"
            />
          </Pressable>
        </Section>

        <Pressable
          onPress={resetSettings}
          className="mt-8 items-center rounded-2xl border border-emerald-700/30 py-4 active:opacity-70"
        >
          <Text className="text-base font-medium text-emerald-700 dark:text-sand-200">
            {t("settings.reset")}
          </Text>
        </Pressable>

        <Text className="mt-6 text-center text-xs text-emerald-700/70 dark:text-sand-200/70">
          {t("settings.storageNote")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  rtl,
  bare,
  children,
}: {
  title: string;
  rtl: boolean;
  /** Set when the child already renders its own card, as MuezzinPicker does. */
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text
        className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-sand-200"
        style={{ textAlign: rtl ? "right" : "left" }}
      >
        {title}
      </Text>
      {bare ? (
        children
      ) : (
        <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
          {children}
        </View>
      )}
    </View>
  );
}

function Row({
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
      className={`items-center justify-between px-5 py-4 active:opacity-60 ${
        rtl ? "flex-row-reverse" : "flex-row"
      } ${isLast ? "" : "border-b border-sand-100 dark:border-emerald-700"}`}
    >
      <View className="flex-1 px-3">
        <Text
          className="text-base text-emerald-900 dark:text-sand-50"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70"
            style={{ textAlign: rtl ? "right" : "left" }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <IconSymbol name="checkmark" size={20} color="#0f766e" />
      ) : null}
    </Pressable>
  );
}
