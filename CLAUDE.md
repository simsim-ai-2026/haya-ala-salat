# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npx expo start                   # dev server (Expo Go SDK 54); i / a / w to open a target
npx tsc --noEmit                 # typecheck
npx expo lint                    # eslint-config-expo (flat config)
npx expo export --platform ios   # full Metro bundle — the only check that catches
                                 # NativeWind/Babel/Metro config breakage
```

No test runner is configured. If you add one, prefer `jest-expo` and record the
single-test invocation here.

`npx expo export` is worth running after touching `babel.config.js`,
`metro.config.js`, `tailwind.config.js`, or `global.css` — those failures do not
surface in `tsc` or `lint`.

## Version pinning

The SDK is pinned to **54** so the app runs in Expo Go 54. Package versions were
resolved with `npx expo install`, which respects the SDK's compatibility table —
use it (not bare `npm install`) for anything in the Expo/React Native ecosystem.
As `AGENTS.md` says, consult the v54 docs rather than latest.

## Architecture

### Data flow

`components/settings.tsx` holds the app's only global state. It is the single
source of truth for the prayer-calculation inputs (method, madhab, coords) and
for display prefs, and it persists on every mutation through `lib/storage.ts`.

Screens read it via `useSettings()` and pass the settings object straight into
`lib/prayer-times.ts`. There is no caching layer between them — adhan is pure
arithmetic, so the schedule is recomputed on each render. `app/(tabs)/index.tsx`
re-renders once per second to drive the countdown; that is deliberate, not an
oversight.

Two details in the settings provider matter:

- Stored settings are **merged over** `DEFAULT_SETTINGS` on load, so fields added
  in a later release get defaults instead of `undefined`. Adding a field means
  adding it to `DEFAULT_SETTINGS`, nothing more.
- `isLoading` is true until AsyncStorage returns. Screens must render a
  placeholder rather than compute against defaults that are about to be replaced.

### adhan boundary

`lib/prayer-times.ts` is the only module that imports `adhan`. Screens work with
its `PrayerEntry[]` / `PrayerName` types. Keep it that way — the wrapper also
normalizes behavior adhan leaves to the caller:

- `PrayerTimes.nextPrayer()` returns `'none'` after Isha. `getNextPrayer()`
  handles the rollover to tomorrow's Fajr.
- Sunrise is in `PRAYER_ORDER` for display but is not a prayer.
- `Qibla` is a default-exported *function*, re-exported under a capitalized name;
  call it as `Qibla(coords)`.

The `adhan` package is `"type": "module"` and its CJS build has broken internal
require paths. Metro resolves the ESM build fine, but a plain
`node -e "require('adhan')"` sanity check will fail — use
`node --input-type=module` instead.

### Styling

NativeWind 4 only. There are no `StyleSheet` objects and no themed wrapper
components in app code; use `className` with `dark:` variants, which follow the
system appearance.

The chain is easy to break silently:

- `global.css` is imported exactly once, at the top of `app/_layout.tsx`.
- `metro.config.js` wraps the config in `withNativeWind({ input: './global.css' })`.
- `babel.config.js` sets `jsxImportSource: 'nativewind'` plus the `nativewind/babel`
  preset.
- **`babel-preset-expo` must stay an explicit devDependency.** The SDK 54 template
  ships without a `babel.config.js`; adding one for NativeWind makes the preset a
  direct resolution target, and Metro fails with `Cannot find module
  'babel-preset-expo'` if it is only a transitive dep.
- A new top-level folder using `className` needs a matching glob in
  `tailwind.config.js` `content`, or its classes are silently dropped.

The `sand` / `emerald` palette lives in `theme.extend.colors`. React Navigation
chrome (tab bar tints) cannot take `className`, so those colors still come from
`constants/theme.ts` — changing the palette means updating both.

### Splash

Two stages, and they must look identical at the handover point:

1. The native splash (`expo-splash-screen` plugin in `app.json`) shows
   `splash-icon.png` at `imageWidth: 220` on `#0b2b22`. It supports an image and a
   background color only — no text.
2. `components/branded-splash.tsx` mounts, calls `hideAsync()` *from an effect* so
   there is no blank frame, then lifts the logo and fades in the wordmark.

`LOGO_WIDTH` in that component must stay equal to `imageWidth` in `app.json`, and
`#0b2b22` appears in three places: the plugin config, the component's
`backgroundColor`, and `brand.night` in `tailwind.config.js`. Change all three.

Only the logo is a bitmap. `node scripts/prep-brand-assets.js` generates every
logo-derived asset — `brand-logo.png`, `splash-icon.png`, `icon.png`,
`favicon.png` and `android-icon-foreground.png`. Rerun it rather than hand-editing
any of those. It depends on `jimp-compact`, present transitively via
`@expo/image-utils` rather than declared.

It prefers the original `logo.png` at the repo root and falls back to the derived
`assets/images/brand-logo.png` with a warning. **The original is currently
missing**, so icons are upscaled from 720px; restoring it and rerunning gives
sharper output.

Two pixel-level details that took a while to get right, and that will silently
regress if the script is rewritten:

- The source shipped with an opaque white background. It is removed by
  flood-filling inward from the corners — a naive white-to-transparent pass
  punches holes in the cream arch interior and the white face of the Kaaba,
  neither of which is reachable from the border.
- Clearing alpha leaves white *RGB* behind, which any later resize interpolates
  back into the artwork as a pale fringe. `bleedEdges()` pushes the real edge
  color underneath the transparency first, sampling a few pixels inside the rim
  (the rim itself is already anti-aliased against white) and running columns
  before rows. App icons additionally get `makeOpaque`, since they must be
  full-bleed — iOS applies its own mask and Android crops to a launcher shape.

The wordmark is **not** an image. `components/brand-wordmark.tsx` renders the
title, tagline and pillar icons as real text and MaterialCommunityIcons glyphs; the
root `image.png` is reference art only. Two things to preserve there:

- Arabic harakat clip on Android at default leading, so the title sets explicit
  `lineHeight` (~1.55×) and vertical padding.
- The icon row is `[...PILLARS].reverse()` so reading order runs right-to-left to
  match the Arabic above it.

### Routing

expo-router with `typedRoutes` and `reactCompiler` enabled in `app.json`. The
compiler handles memoization; do not add `useMemo`/`useCallback` to screens
without a measured reason.

`components/ui/icon-symbol.tsx` maps SF Symbol names to Material Icons for
Android/web, with `icon-symbol.ios.tsx` using the native symbol. Any new icon
name must be added to the `MAPPING` object or it renders blank off-iOS.

### i18n

`lib/i18n.ts` holds every user-facing string for `en` / `ar` / `fr`. The `EN`
dictionary is the source of truth for the key set — `AR` and `FR` are typed
`Record<StringKey, string>`, so adding a key fails the build until all three have
it. That is deliberate: a missing key would otherwise fall back silently at
runtime and never be noticed. There is no string-loading step; it is a plain
object, so adding a language means adding an entry to `LANGUAGES`, a dictionary,
and a `LOCALES` row.

Screens read it through `useTranslation()` (in `hooks/`, not `lib/`, so the i18n
module stays free of React and of any import back into the settings context).
Prayer display names live there too under `prayer.*` rather than in
`lib/prayer-times.ts` — `translate('ar', ...)` is called directly to keep the
Arabic name as a subtitle when the UI language is not Arabic.

`LOCALES.ar` is `ar-u-nu-latn`, forcing Latin digits. The countdown is assembled
from numbers by hand and is always Latin, so Arabic-Indic numerals on the clock
would put two numbering systems on one screen.

RTL is handled per-component (`rtl` from `useTranslation()` drives
`flex-row-reverse` and `textAlign`), **not** through `I18nManager.forceRTL`, which
needs a full app restart to take effect. Navigator chrome and the tab bar
therefore stay LTR in Arabic.

### Adhan audio

`lib/muezzin.ts` is a registry of recitations. Two ship in `assets/audio/`, both
CC BY-SA 4.0 from Wikimedia Commons; `assets/audio/CREDITS.md` records the
authors and licences.

**The attribution rendered under Settings → Adhan is a licence obligation, not
decoration.** Removing it breaches CC BY-SA. Any recitation added to
`MUEZZIN_OPTIONS` needs an `attribution` entry, and it must actually be licensed
for redistribution — a recording of the adhan is a protected performance whatever
the age of the words, and some Commons uploads carry a bogus "public domain" tag
reasoning from the antiquity of the text.

`source` cannot be a `require()` of a file that does not exist — Metro fails the
build — so audio has to land in the same change as its registry entry.

`components/muezzin-picker.tsx` holds **one** `useAudioPlayer` and calls
`replace()` to switch recordings, rather than mounting a player per row. It sets
`playsInSilentMode` so the preview is audible with the ringer off, and pauses on
unmount — a preview is a decision aid, not playback the user expects to continue.

Choosing a recitation does **not** yet make it play at prayer time. That needs
scheduled local notifications with a custom sound, which is a separate piece of
work. The permission half of it exists: the onboarding notification step calls
`lib/notifications.ts`, which creates the Android `prayer-reminders` channel and
stores consent in `Settings.notificationsEnabled`. Nothing reads that flag yet.

`getNotificationPermission()` returns `undetermined` separately from `denied`
(`granted` plus `canAskAgain`) because the OS dialog only appears once per
install — UI that cannot tell them apart offers an "Allow" button that silently
resolves to a months-old answer. Local notifications work in Expo Go on both
platforms; only remote push is unavailable there since SDK 53.

### Location gate

Onboarding is two gates in `app/(tabs)/_layout.tsx`, checked in order:
`hasSetLocation` redirects to `/location-setup`, then `hasCompletedSetup`
redirects to `/setup-preferences` (language, calculation method, notification
permission, muezzin, clock format — one screen driven by `STEPS`). Both fire
behind the splash overlay, so first-run users never see the tabs flash.
`DEFAULT_SETTINGS.coords` (Casablanca) is only the map's starting point, never a
schedule the user has agreed to.

Adding a step means adding a flag to `Settings`, a screen, and a gate here — the
screens themselves do not know the sequence, so they stay reorderable.

Three things there are load-bearing:

- Both onboarding screens finish by setting their flag and navigating **from an
  effect**, once the flag is visible in context. Navigating in the same tick races
  the tab layout's redirect and bounces the user back, losing their input.
- `setup-preferences` writes the language immediately on tap rather than on
  Continue, so the step relabels itself in the chosen language as a preview.
- `LocationPickerMap` is uncontrolled — `initialRegion` plus an imperative
  `animateToRegion` keyed on `focusToken`. A controlled `region` fights the user's
  own pan and drag gestures.

Search above the map uses the **platform geocoder** (`Location.geocodeAsync`), not
a third-party service — no API key, nothing to configure. Its cost is that it
returns coordinates with no names, so `searchPlaces()` reverse geocodes every hit
to build a label. That is two round trips per result, which is why the input
debounces at 450ms and caps at four suggestions: Apple's CLGeocoder throttles
aggressively and Android errors when several requests are in flight. Android also
refuses to geocode at all without foreground location permission, so
`searchPlaces()` requests it before the first query.

`react-native-maps` has no web implementation, so `location-picker-map.web.tsx`
renders a coordinate readout instead; browser geolocation still works there. Keep
the two files' props in sync — the web variant imports its prop type from the
native one. `geocodeAsync` is also native-only, so search degrades to its "search
unavailable" hint on web rather than breaking.

For a store build, Google Maps needs API keys in `app.json`
(`ios.config.googleMapsApiKey`, `android.config.googleMaps.apiKey`). Expo Go
supplies its own, so nothing is needed for development.
