import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettings } from "@/components/settings";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTranslation, type Translator } from "@/hooks/use-translation";
import { translate } from "@/lib/i18n";
import {
  formatCountdown,
  formatTime,
  getNextPrayer,
  getPrayerTimes,
  toSchedule,
  type PrayerEntry,
} from "@/lib/prayer-times";

/** Ticks once per second so the countdown stays live. */
function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

export default function PrayerTimesScreen() {
  const { settings, isLoading } = useSettings();
  const { t, language, locale, rtl } = useTranslation();
  const now = useNow();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand-50 dark:bg-emerald-900">
        <Text className="text-emerald-800 dark:text-sand-100">
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  // adhan is pure arithmetic, so recomputing each tick is cheap.
  const schedule = toSchedule(
    getPrayerTimes(settings.coords, settings, now),
    now,
  );
  const next = getNextPrayer(settings.coords, settings, now);
  const align = { textAlign: rtl ? ("right" as const) : ("left" as const) };

  return (
    <SafeAreaView
      className="flex-1 bg-sand-50 dark:bg-emerald-900"
      edges={["top"]}
    >
      <ScrollView contentContainerClassName="px-5 pb-8">
        <View className="pb-6 pt-4">
          <Text className="text-3xl font-bold text-emerald-800 dark:text-sand-50">
            حي على الصلاة
          </Text>
          <View
            className={`mt-2 items-center gap-1 ${rtl ? "flex-row-reverse" : "flex-row"}`}
          >
            <IconSymbol name="location.fill" size={14} color="#0f766e" />
            <Text className="text-sm text-emerald-700 dark:text-sand-200">
              {settings.locationName}
            </Text>
          </View>
        </View>

        <View className="rounded-3xl bg-emerald-700 p-6 dark:bg-emerald-800">
          <Text
            className="text-xs uppercase tracking-widest text-sand-200"
            style={align}
          >
            {t("prayer.nextPrayer")}
          </Text>
          <Text
            className="mt-1 text-2xl font-semibold text-white"
            style={align}
          >
            {t(`prayer.${next.name}`)}
          </Text>
          <Text className="mt-3 text-5xl font-bold text-white" style={align}>
            {formatCountdown(next.time, now)}
          </Text>
          <Text className="mt-2 text-sm text-sand-200" style={align}>
            {t("prayer.at")} {formatTime(next.time, settings.use24Hour, locale)}
          </Text>
        </View>

        <Text
          className="mb-3 mt-8 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-sand-200"
          style={align}
        >
          {now.toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>

        <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
          {schedule.map((entry, index) => (
            <PrayerRow
              key={entry.name}
              entry={entry}
              t={t}
              // Arabic is the language of the adhan, so it stays as a subtitle
              // unless it is already the primary label.
              showArabic={language !== "ar"}
              rtl={rtl}
              use24Hour={settings.use24Hour}
              locale={locale}
              isLast={index === schedule.length - 1}
            />
          ))}
        </View>

        <Text className="mt-6 text-center text-xs text-emerald-700/70 dark:text-sand-200/70">
          {t("prayer.calculatedWith")} · {settings.method}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrayerRow({
  entry,
  t,
  showArabic,
  rtl,
  use24Hour,
  locale,
  isLast,
}: {
  entry: PrayerEntry;
  t: Translator;
  showArabic: boolean;
  rtl: boolean;
  use24Hour: boolean;
  locale: string;
  isLast: boolean;
}) {
  const align = { textAlign: rtl ? ("right" as const) : ("left" as const) };

  return (
    <View
      className={`items-center justify-between px-5 py-4 ${
        rtl ? "flex-row-reverse" : "flex-row"
      } ${isLast ? "" : "border-b border-sand-100 dark:border-emerald-700"} ${
        entry.isNext ? "bg-sand-100 dark:bg-emerald-700" : ""
      }`}
    >
      <View>
        <Text
          className="text-base font-medium text-emerald-900 dark:text-sand-50"
          style={align}
        >
          {t(`prayer.${entry.name}`)}
        </Text>
        {showArabic ? (
          <Text
            className="text-xs text-emerald-700/70 dark:text-sand-200/70"
            style={align}
          >
            {translate("ar", `prayer.${entry.name}`)}
          </Text>
        ) : null}
      </View>
      <Text
        className={`text-base ${
          entry.isNext
            ? "font-bold text-emerald-800 dark:text-white"
            : "text-emerald-900 dark:text-sand-100"
        }`}
      >
        {formatTime(entry.time, use24Hour, locale)}
      </Text>
    </View>
  );
}
