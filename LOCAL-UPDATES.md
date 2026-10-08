# GitHub checkout and work-break update

Nimbo artwork/motion follow-up: official GitHub PNGs have been re-fetched and hash-verified; all whole-image animation is disabled. See [NIMBO-ANIMATION.md](NIMBO-ANIMATION.md) for the inspected asset limits and the proposed paw/eyelid/mouth animation workflow. The earlier 36-test count below refers to the work-break update before this follow-up.

Source: https://github.com/Bayekai/MoonLoom . Cloned the repository's default branch `jules-audit-and-plan-6031774214861600124`, base commit `7941421` (official Nimbo PNG assets). These edits are local in this checkout; no GitHub branch, commit, or PR has been published.

## Applied
The existing React Native/Expo application now has opt-in work reminders, arbitrary selected weekdays, validated overnight shifts and automatic midpoints, optional two/three-hour or custom intervals, five/ten-minute breaks, fifteen-minute snooze, skip-current-shift, pause/resume, workday-finished controls, and restored timers after reload. Nimbo uses its existing BREAK_TIME artwork/controller. Tone can be Supportive, Calm, Motivational, Funny, or Direct; all styles preserve the recommendation. The Home and Work routes are retained.

Work settings and runtime decisions are an additive Zustand/AsyncStorage field; existing profile, sleep sessions, lifestyle events, legacy work-break records, experiments and memories are retained. Sleep/wake buttons now persist a sleep flag so reminders remain quiet while sleeping. Timed breaks do not change the existing food balance or sleep rewards. Legacy work-break records remain in storage, but the previous immediate-completion/food-grant screen is replaced by the real timer.

The new notification adapters request permission only through the explicit button. Web reminders need an open app; native local notifications reconcile future slots (at most 48), respect recorded sleep/pause/skip/completed decisions, and cancel only their own namespace. Native schedules need reopening at least weekly and remain subject to OS delivery settings. Native notification delivery has not been device-tested; adding this module/config plugin requires a development build for native acceptance testing.

This repository retains its existing AsyncStorage persistence. It does not use the encrypted PWA vault from `../moonloom`, and no personal journal data has been imported from that prototype. No API credentials or remote AI backend were added.

## Run
From this directory with Node 22.13+ and npm:

```text
npm ci
npm run preview
```

This serves the Expo app at http://localhost:8082 . In a second terminal, `npm run simulator` starts a localhost phone-frame preview and prints its URL. The preview is the actual React Native web application inside an iframe, not an Android emulator. This machine has no discovered Android emulator/SDK. The original app on port 4173 was left intact.

If the sandbox blocks Expo's user-cache write, use `EXPO_OFFLINE=1` and `EXPO_NO_TELEMETRY=1`; the npm registry remains separate from Expo's metadata requests. The development session here uses these variables and CI mode (no live reload). Restart/reload after source edits in that mode. `dist/` contains the successful production web export; serve it over HTTP with SPA route fallback for direct route access.

## Checks
- TypeScript: passes (`npm run typecheck`).
- Tests: 36 pass across six suites (`npm test -- --runInBand`). Covers existing sleep/Nimbo services, migrated work rules, overnight/DST scheduling, snooze/suppression, restored timers, food preservation and native notification plans.
- Lint: no errors, six existing Home/Nimbo warnings (`npm run lint`).
- Production web export: passes (`npx expo export --platform web --max-workers 0`).
- Browser: verified onboarding, existing Home navigation, arbitrary workdays, 22:00–06:00 → 02:00 midpoint, live reminder, five-minute timer, BREAK_TIME artwork and timer restoration in the phone frame.

Native-device tests, OS notification permission/delivery, and force-quit/reboot behavior remain unverified. The preview browser data is a fresh local app profile with demo work hours, not data copied from your existing journal.
