# Haya ala Salat · حي على الصلاة

A prayer times app built with Expo SDK 54 (runs in Expo Go), React Native,
TypeScript, NativeWind and [adhan-js](https://github.com/batoulapps/adhan-js).

Today's schedule with a live countdown to the next prayer, calculated locally for
a location you pick on a map. English, العربية and Français, with full RTL. No
account, no backend, no API keys.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go (SDK 54)**, or press `i` / `a` / `w`.

The SDK is pinned to 54. Use `npx expo install` rather than bare `npm install`
for anything in the Expo/React Native ecosystem — it respects the SDK's
compatibility table.

## Stack

| Concern     | Choice                                                          |
| ----------- | --------------------------------------------------------------- |
| Runtime     | Expo SDK 54 · React Native 0.81 · React 19.1 · New Architecture   |
| Navigation  | expo-router (file-based, typed routes) with a bottom tab bar      |
| Styling     | NativeWind 4 (Tailwind CSS 3.4) via `className` — no `StyleSheet` |
| Persistence | `@react-native-async-storage/async-storage`                       |
| Prayer math | `adhan`                                                           |
| Location    | `expo-location` + a `react-native-maps` picker on first run       |
| Audio       | `expo-audio` for adhan previews                                   |

## Layout

```
app/
  _layout.tsx             root stack, imports global.css, mounts SettingsProvider
  location-setup.tsx      first-run: search / map pin / current location
  setup-preferences.tsx   first-run: language, calculation method, muezzin
  (tabs)/_layout.tsx      bottom tabs + the two onboarding gates
  (tabs)/index.tsx        today's schedule and the live countdown
  (tabs)/settings.tsx     location, language, method, madhab, clock, adhan
components/
  settings.tsx            settings context, backed by AsyncStorage
  branded-splash.tsx      second splash stage: lifts the logo, fades in the wordmark
  brand-wordmark.tsx      title, tagline and pillar icons as real text — not an image
  location-picker-map.tsx map picker (`.web.tsx` renders a coordinate readout)
  location-search.tsx     debounced platform-geocoder search above the map
  muezzin-picker.tsx      recitation list with inline preview and attribution
  haptic-tab.tsx          tab button with iOS haptics
  ui/icon-symbol.tsx      SF Symbols on iOS, Material Icons elsewhere
hooks/
  use-translation.ts      t(), language, locale, rtl
lib/
  prayer-times.ts         adhan wrapper: schedule, next prayer, qibla, formatting
  i18n.ts                 every user-facing string, for en / ar / fr
  muezzin.ts              recitation registry + licence attribution
  location.ts             geocoding and reverse geocoding helpers
  notifications.ts        notification permission + the Android reminder channel
  storage.ts              JSON AsyncStorage helpers, namespaced under `has:`
scripts/
  prep-brand-assets.js    regenerates every logo-derived image from logo.png
```

## How it fits together

`components/settings.tsx` is the app's only global state and the single source of
truth for calculation inputs (method, madhab, coordinates) and display
preferences. It persists on every mutation. Screens read it with `useSettings()`
and pass it straight into `lib/prayer-times.ts` — there is no cache in between,
because adhan is pure arithmetic. The home screen re-renders once a second to
drive the countdown; that is deliberate.

Stored settings are merged over `DEFAULT_SETTINGS` on load, so a field added in a
later release gets a default instead of `undefined`. `isLoading` stays true until
AsyncStorage returns, and screens render a placeholder rather than compute
against defaults that are about to be replaced.

`lib/prayer-times.ts` is the only module that imports `adhan`, and it normalizes
the things adhan leaves to the caller — the rollover to tomorrow's Fajr after
Isha, and sunrise being in the display order without being a prayer.

## First run

Onboarding is two gates in `app/(tabs)/_layout.tsx`, checked in order and both
resolved behind the splash overlay, so the tabs never flash:

1. **Location** (`/location-setup`) — search for a city, drop a pin, or tap **Use
   my current location**. The pick is reverse-geocoded to a city name. The
   default coordinates (Casablanca) are only the map's starting point, never a
   schedule the user has agreed to.
2. **Preferences** (`/setup-preferences`) — five steps in one screen: language,
   the calculation authority whose sun angles to use, notification permission,
   which muezzin to hear (with an inline preview), and 12- vs 24-hour clock. The
   language is written on tap rather than on Continue, so the step relabels
   itself as a preview of the choice.

The notification step offers **Allow** only while the OS would actually show its
dialog — `lib/notifications.ts` distinguishes *undetermined* from *refused*,
because the system prompt appears once per install and a second press would
resolve silently to the old answer. Refusal is a state the step explains, not an
error it retries. Granting it sets `notificationsEnabled`; nothing schedules
reminders off that flag yet.

Everything there is reachable afterwards from the Settings tab.

Search uses the platform geocoder via `expo-location`, so there is no API key to
configure. It is native-only: on web the map and search fall back to a coordinate
readout plus browser geolocation. A store build additionally needs Google Maps
keys in `app.json` (`ios.config.googleMapsApiKey`,
`android.config.googleMaps.apiKey`); Expo Go supplies its own.

## Adhan audio

Four freely-licensed recitations ship in `assets/audio/`, registered in
`lib/muezzin.ts`. The attribution shown under **Settings → Adhan** is a licence
obligation, not decoration — CC BY-SA requires it.

Anything added to `MUEZZIN_OPTIONS` needs an `attribution` entry and must
actually be licensed for redistribution: a recording of the adhan is a protected
performance whatever the age of the words. See
[`assets/audio/CREDITS.md`](assets/audio/CREDITS.md) and
[`assets/audio/README.md`](assets/audio/README.md).

Choosing a recitation does **not** yet make it play at prayer time. That needs
`expo-notifications` with scheduled local notifications and a custom sound, and
is not implemented.

## Internationalisation

`lib/i18n.ts` holds every user-facing string for `en` / `ar` / `fr`. `EN` defines
the key set; `AR` and `FR` are typed against it, so a missing translation is a
build error rather than a silent runtime fallback. Adding a language means adding
an entry to `LANGUAGES`, a dictionary, and a `LOCALES` row.

RTL is handled per component — `rtl` from `useTranslation()` drives
`flex-row-reverse` and `textAlign` — rather than `I18nManager.forceRTL`, which
would need a full app restart to take effect. Navigator chrome therefore stays
LTR in Arabic. `LOCALES.ar` is `ar-u-nu-latn` so digits stay Latin; the countdown
is assembled from numbers by hand and is always Latin, and two numbering systems
on one screen would look like a bug.

## Styling and branding

- Tailwind classes come from `tailwind.config.js`; the `sand` / `emerald` palette
  lives under `theme.extend.colors`. React Navigation chrome cannot take
  `className`, so tab bar tints still come from `constants/theme.ts` — changing
  the palette means updating both.
- `global.css` holds the Tailwind directives and is imported once, in
  `app/_layout.tsx`.
- Dark mode follows the system appearance — use `dark:` variants.
- A new top-level folder that uses `className` needs a matching glob in
  `content` in `tailwind.config.js`, or its classes are silently dropped.
- The splash is two stages that must match at the handover: the native splash
  (`expo-splash-screen` in `app.json`) and `components/branded-splash.tsx`.
  `LOGO_WIDTH` there must equal `imageWidth` in `app.json`, and `#0b2b22` appears
  in the plugin config, the component, and `brand.night` in `tailwind.config.js`.
- Only the logo is a bitmap. `node scripts/prep-brand-assets.js` regenerates
  `brand-logo.png`, `splash-icon.png`, `icon.png`, `favicon.png` and
  `android-icon-foreground.png` — rerun it rather than hand-editing any of them.

## Checks

```bash
npx tsc --noEmit                 # types
npx expo lint                    # lint
npx expo export --platform ios   # full Metro bundle
```

No test runner is configured.

The export is the only check that catches NativeWind/Babel/Metro breakage — run
it after touching `babel.config.js`, `metro.config.js`, `tailwind.config.js` or
`global.css`. Those failures do not surface in `tsc` or `lint`.
