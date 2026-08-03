export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'fr', label: 'French', native: 'Français' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

/** Languages that read right to left. Drives text alignment and row order. */
const RTL_LANGUAGES: LanguageCode[] = ['ar'];

export function isRTL(language: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * English is the source of truth for the key set: the other dictionaries are
 * typed against it, so adding a string here fails the build until every language
 * has it. That is deliberate — a missing key would otherwise silently fall back
 * to English at runtime and never get noticed.
 */
const EN = {
  'tab.prayerTimes': 'Prayer Times',
  'tab.settings': 'Settings',

  'common.loading': 'Loading…',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.done': 'Done',
  'common.cancel': 'Cancel',

  'prayer.nextPrayer': 'Next prayer',
  'prayer.at': 'at',
  'prayer.calculatedWith': 'Calculated with adhan',

  'settings.title': 'Settings',
  'settings.display': 'Display',
  'settings.use24Hour': '24-hour clock',
  'settings.language': 'Language',
  'settings.madhab': 'Madhab (Asr calculation)',
  'settings.madhab.shafi': 'Shafi',
  'settings.madhab.shafiHint': 'Maliki, Hanbali — earlier Asr',
  'settings.madhab.hanafi': 'Hanafi',
  'settings.madhab.hanafiHint': 'Later Asr',
  'settings.method': 'Calculation method',
  'settings.location': 'Location',
  'settings.reset': 'Reset to defaults',
  'settings.storageNote': 'Preferences are saved on this device with AsyncStorage.',

  'location.title': 'Where are you praying?',
  'location.editTitle': 'Change location',
  'location.subtitle': 'Prayer times depend on your exact position. Tap the map or drag the pin.',
  'location.search': 'Search for a city',
  'location.clearSearch': 'Clear search',
  'location.searching': 'Searching…',
  'location.noMatch': 'No matching place found.',
  'location.searchUnavailable': 'Search is unavailable right now. Tap the map instead.',
  'location.searchNeedsPermission': 'Location permission is required to search on Android.',
  'location.useCurrent': 'Use my current location',
  'location.locating': 'Locating…',
  'location.confirm': 'Confirm location',
  'location.save': 'Save location',
  'location.unavailableTitle': 'Location unavailable',
  'location.denied': 'Location permission was declined. You can still pick your city on the map.',
  'location.disabled':
    'Location services are turned off. Turn them on, or pick your city on the map.',
  'location.error': 'Could not determine your location. Please pick your city on the map.',
  'location.webOnly':
    'The interactive map is only available on iOS and Android. Use the button below to detect your location.',

  'setup.languageTitle': 'Choose your language',
  'setup.languageSubtitle': 'This changes the labels throughout the app.',
  'setup.methodTitle': 'Calculation method',
  'setup.methodSubtitle':
    'Different authorities use different sun angles for Fajr and Isha. Pick the one used where you pray.',
  'setup.finish': 'Start praying',
  'setup.step': 'Step {current} of {total}',
  'setup.muezzinTitle': 'Choose the adhan',
  'setup.muezzinSubtitle': 'The voice you will hear when it is time to pray.',

  'muezzin.title': 'Adhan',
  'muezzin.none': 'Silent',
  'muezzin.noneHint': 'No adhan sound',
  'muezzin.casablanca': 'Hassan II Mosque',
  'muezzin.casablancaHint': 'Casablanca, Morocco',
  'muezzin.dohaStandard': 'Doha — standard adhan',
  'muezzin.dohaStandardHint': 'Qatar · Dhuhr, Asr, Maghrib, Isha',
  'muezzin.kalkan': 'Kalkan',
  'muezzin.kalkanHint': 'Türkiye · evening call',
  'muezzin.aaqibAzeez': 'Aaqib Azeez',
  'muezzin.aaqibAzeezHint': 'Solo recitation',
  'muezzin.unavailable': 'Recording not added yet',
  'muezzin.play': 'Preview',
  'muezzin.stop': 'Stop preview',
  'muezzin.credits': 'Recordings from Wikimedia Commons, used under their licences.',

  'prayer.fajr': 'Fajr',
  'prayer.sunrise': 'Sunrise',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',
} as const;

export type StringKey = keyof typeof EN;

type Dictionary = Record<StringKey, string>;

const AR: Dictionary = {
  'tab.prayerTimes': 'مواقيت الصلاة',
  'tab.settings': 'الإعدادات',

  'common.loading': 'جارٍ التحميل…',
  'common.continue': 'متابعة',
  'common.back': 'رجوع',
  'common.done': 'تم',
  'common.cancel': 'إلغاء',

  'prayer.nextPrayer': 'الصلاة القادمة',
  'prayer.at': 'في',
  'prayer.calculatedWith': 'محسوبة بواسطة adhan',

  'settings.title': 'الإعدادات',
  'settings.display': 'العرض',
  'settings.use24Hour': 'نظام ٢٤ ساعة',
  'settings.language': 'اللغة',
  'settings.madhab': 'المذهب (حساب العصر)',
  'settings.madhab.shafi': 'الشافعي',
  'settings.madhab.shafiHint': 'المالكي والحنبلي — العصر مبكر',
  'settings.madhab.hanafi': 'الحنفي',
  'settings.madhab.hanafiHint': 'العصر متأخر',
  'settings.method': 'طريقة الحساب',
  'settings.location': 'الموقع',
  'settings.reset': 'استعادة الإعدادات الافتراضية',
  'settings.storageNote': 'يتم حفظ التفضيلات على هذا الجهاز.',

  'location.title': 'أين تصلي؟',
  'location.editTitle': 'تغيير الموقع',
  'location.subtitle': 'تعتمد مواقيت الصلاة على موقعك بدقة. اضغط على الخريطة أو حرّك المؤشر.',
  'location.search': 'ابحث عن مدينة',
  'location.clearSearch': 'مسح البحث',
  'location.searching': 'جارٍ البحث…',
  'location.noMatch': 'لم يتم العثور على مكان مطابق.',
  'location.searchUnavailable': 'البحث غير متاح حالياً. استخدم الخريطة بدلاً من ذلك.',
  'location.searchNeedsPermission': 'إذن الموقع مطلوب للبحث على أندرويد.',
  'location.useCurrent': 'استخدم موقعي الحالي',
  'location.locating': 'جارٍ تحديد الموقع…',
  'location.confirm': 'تأكيد الموقع',
  'location.save': 'حفظ الموقع',
  'location.unavailableTitle': 'الموقع غير متاح',
  'location.denied': 'تم رفض إذن الموقع. يمكنك اختيار مدينتك على الخريطة.',
  'location.disabled': 'خدمات الموقع معطّلة. فعّلها أو اختر مدينتك على الخريطة.',
  'location.error': 'تعذّر تحديد موقعك. الرجاء اختيار مدينتك على الخريطة.',
  'location.webOnly': 'الخريطة التفاعلية متاحة على iOS و أندرويد فقط. استخدم الزر أدناه لتحديد موقعك.',

  'setup.languageTitle': 'اختر لغتك',
  'setup.languageSubtitle': 'يغيّر هذا لغة الواجهة في التطبيق بأكمله.',
  'setup.methodTitle': 'طريقة الحساب',
  'setup.methodSubtitle':
    'تعتمد كل هيئة زوايا شمس مختلفة للفجر والعشاء. اختر المعتمدة في مكان صلاتك.',
  'setup.finish': 'ابدأ',
  'setup.step': 'الخطوة {current} من {total}',
  'setup.muezzinTitle': 'اختر الأذان',
  'setup.muezzinSubtitle': 'الصوت الذي ستسمعه عند دخول وقت الصلاة.',

  'muezzin.title': 'الأذان',
  'muezzin.none': 'صامت',
  'muezzin.noneHint': 'بدون صوت أذان',
  'muezzin.casablanca': 'مسجد الحسن الثاني',
  'muezzin.casablancaHint': 'الدار البيضاء، المغرب',
  'muezzin.dohaStandard': 'الدوحة — الأذان العادي',
  'muezzin.dohaStandardHint': 'قطر · الظهر والعصر والمغرب والعشاء',
  'muezzin.kalkan': 'كالكان',
  'muezzin.kalkanHint': 'تركيا · أذان المساء',
  'muezzin.aaqibAzeez': 'عاقب عزيز',
  'muezzin.aaqibAzeezHint': 'أذان منفرد',
  'muezzin.unavailable': 'لم تتم إضافة التسجيل بعد',
  'muezzin.play': 'استماع',
  'muezzin.stop': 'إيقاف',
  'muezzin.credits': 'التسجيلات من ويكيميديا كومنز، مستخدمة وفق رخصها.',

  'prayer.fajr': 'الفجر',
  'prayer.sunrise': 'الشروق',
  'prayer.dhuhr': 'الظهر',
  'prayer.asr': 'العصر',
  'prayer.maghrib': 'المغرب',
  'prayer.isha': 'العشاء',
};

const FR: Dictionary = {
  'tab.prayerTimes': 'Horaires',
  'tab.settings': 'Réglages',

  'common.loading': 'Chargement…',
  'common.continue': 'Continuer',
  'common.back': 'Retour',
  'common.done': 'Terminé',
  'common.cancel': 'Annuler',

  'prayer.nextPrayer': 'Prochaine prière',
  'prayer.at': 'à',
  'prayer.calculatedWith': 'Calculé avec adhan',

  'settings.title': 'Réglages',
  'settings.display': 'Affichage',
  'settings.use24Hour': 'Format 24 heures',
  'settings.language': 'Langue',
  'settings.madhab': 'Madhab (calcul du Asr)',
  'settings.madhab.shafi': 'Shafi',
  'settings.madhab.shafiHint': 'Maliki, Hanbali — Asr plus tôt',
  'settings.madhab.hanafi': 'Hanafi',
  'settings.madhab.hanafiHint': 'Asr plus tard',
  'settings.method': 'Méthode de calcul',
  'settings.location': 'Localisation',
  'settings.reset': 'Réinitialiser',
  'settings.storageNote': 'Les préférences sont enregistrées sur cet appareil.',

  'location.title': 'Où priez-vous ?',
  'location.editTitle': 'Changer de lieu',
  'location.subtitle':
    'Les horaires dépendent de votre position exacte. Touchez la carte ou déplacez le repère.',
  'location.search': 'Rechercher une ville',
  'location.clearSearch': 'Effacer la recherche',
  'location.searching': 'Recherche…',
  'location.noMatch': 'Aucun lieu correspondant.',
  'location.searchUnavailable': 'La recherche est indisponible. Utilisez la carte.',
  'location.searchNeedsPermission': "L'autorisation de localisation est requise sur Android.",
  'location.useCurrent': 'Utiliser ma position',
  'location.locating': 'Localisation…',
  'location.confirm': 'Confirmer le lieu',
  'location.save': 'Enregistrer',
  'location.unavailableTitle': 'Position indisponible',
  'location.denied':
    'Autorisation refusée. Vous pouvez choisir votre ville sur la carte.',
  'location.disabled':
    'Les services de localisation sont désactivés. Activez-les ou choisissez votre ville sur la carte.',
  'location.error': 'Impossible de déterminer votre position. Choisissez votre ville sur la carte.',
  'location.webOnly':
    "La carte interactive n'est disponible que sur iOS et Android. Utilisez le bouton ci-dessous.",

  'setup.languageTitle': 'Choisissez votre langue',
  'setup.languageSubtitle': "Cela change les libellés dans toute l'application.",
  'setup.methodTitle': 'Méthode de calcul',
  'setup.methodSubtitle':
    'Chaque autorité utilise des angles solaires différents pour le Fajr et le Isha. Choisissez celle de votre lieu.',
  'setup.finish': 'Commencer',
  'setup.step': 'Étape {current} sur {total}',
  'setup.muezzinTitle': "Choisissez l'adhan",
  'setup.muezzinSubtitle': "La voix que vous entendrez à l'heure de la prière.",

  'muezzin.title': 'Adhan',
  'muezzin.none': 'Silencieux',
  'muezzin.noneHint': "Pas de son d'adhan",
  'muezzin.casablanca': 'Mosquée Hassan II',
  'muezzin.casablancaHint': 'Casablanca, Maroc',
  'muezzin.dohaStandard': 'Doha — adhan standard',
  'muezzin.dohaStandardHint': 'Qatar · Dhuhr, Asr, Maghrib, Isha',
  'muezzin.kalkan': 'Kalkan',
  'muezzin.kalkanHint': 'Türkiye · appel du soir',
  'muezzin.aaqibAzeez': 'Aaqib Azeez',
  'muezzin.aaqibAzeezHint': 'Récitation solo',
  'muezzin.unavailable': 'Enregistrement non ajouté',
  'muezzin.play': 'Écouter',
  'muezzin.stop': 'Arrêter',
  'muezzin.credits': 'Enregistrements de Wikimedia Commons, utilisés selon leurs licences.',

  'prayer.fajr': 'Fajr',
  'prayer.sunrise': 'Lever du soleil',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',
};

const STRINGS: Record<LanguageCode, Dictionary> = { en: EN, ar: AR, fr: FR };

/**
 * Locale passed to `toLocaleTimeString` / `toLocaleDateString`.
 *
 * Arabic forces Latin digits (`-u-nu-latn`). The countdown is built by hand from
 * numbers and is always Latin, so leaving Arabic-Indic numerals on for the clock
 * would put two different numbering systems on the same screen.
 */
export const LOCALES: Record<LanguageCode, string> = {
  en: 'en-GB',
  ar: 'ar-u-nu-latn',
  fr: 'fr-FR',
};

export function translate(
  language: LanguageCode,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  let value: string = STRINGS[language][key];
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}
