import { useSettings } from '@/components/settings';
import { isRTL, LOCALES, translate, type LanguageCode, type StringKey } from '@/lib/i18n';

export type Translator = (key: StringKey, vars?: Record<string, string | number>) => string;

/**
 * Reads the chosen language out of settings and binds it to `translate`.
 *
 * Lives in `hooks/` rather than `lib/i18n.ts` so that the i18n module stays free
 * of React and of any import back into the settings context.
 */
export function useTranslation(): {
  t: Translator;
  language: LanguageCode;
  locale: string;
  rtl: boolean;
} {
  const { settings } = useSettings();
  const language = settings.language;

  return {
    t: (key, vars) => translate(language, key, vars),
    language,
    locale: LOCALES[language],
    rtl: isRTL(language),
  };
}
