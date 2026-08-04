# Notification alert sounds

Generated files. **Do not edit or add by hand** — run

```bash
node scripts/prep-notification-sounds.js
```

which rewrites all of them from the recitations in [`../audio`](../audio).

They exist because the shipped MP3s cannot be used as an OS alert sound: iOS
plays no notification sound longer than **30 seconds** (falling back to the
default chime, silently) and does not support MP3 at all. Each file here is the
first 28 seconds of its recitation, faded out, as mono 22.05 kHz PCM.

The full recitation still plays in-app through expo-audio when the notification
arrives with the app open.

| File | Recitation |
| --- | --- |
| `adhan_casablanca.wav` | `casablanca-hassan-ii.mp3` |
| `adhan_doha.wav` | `doha-standard.mp3` |
| `adhan_kalkan.wav` | `kalkan-turkey.mp3` |
| `adhan_aaqib.wav` | `aaqib-azeez.mp3` |

Licensing follows the sources — see [`../audio/CREDITS.md`](../audio/CREDITS.md).
A trimmed copy is a derivative work, so the CC BY-SA attribution shown in
Settings covers these too.

Names are lowercase with underscores because they become Android resource names
in `res/raw`; the expo-notifications config plugin rejects anything else at
prebuild. Each one has to be listed in that plugin's `sounds` array in
`app.json`, or it is not in the bundle and the alert falls back to the default.
