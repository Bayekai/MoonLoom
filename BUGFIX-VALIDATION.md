# MoonLoom bug fixes — 2026-10-16

Fixed sleep logging crashes from malformed HH:MM values, negative/zero intervals,
incorrect daytime sleep dating, and discarded morning ratings. The manual form
uses the most recent completed interval and shows inline validation/success text.

Fixed overlapping Nimbo action timers: waking cancels pending sleep, sleep cancels
feeding reactions, repeated feeding taps cannot spend food repeatedly, and delayed
callbacks do not overwrite a newer controller state. Feeding during wake-up returns
to happy instead of restoring a stuck waking pose. Sleeping disables feeding.

Fixed privacy deletion: clear only MoonLoom's key, reset live progress and pending
Nimbo actions, reconcile work notifications, and return to onboarding. Replaced the
native-only alert confirmation with a cross-platform modal and explicit Cancel/
Delete controls. Actual user data was not deleted during browser testing.

Validation:
- TypeScript and ESLint pass without errors or warnings.
- 103 unit tests across 11 suites pass, including new failure/transition cases.
- Isolated localhost:8094 browser: onboarding, invalid sleep input, successful
  overnight logging, 8-hour average, food reward/feeding, sleep/wake, work screen,
  privacy confirmation and cancel verified. Test data stays on that origin.
- Expo Doctor: 20/21 checks pass. Dependency compatibility check recommends newer
  SDK 57 patches for nine packages. Dependencies were kept unchanged in this fix;
  the installed Android development build has not been rebuilt or phone-verified.

The previously prepared localized Rive movement adjustment is preserved separately.
Production Rive activation remains disabled. Native ear/tail motion still needs
confirmation on the phone; candidate status alone is not visual approval.
