# Nimbo kit handoff for Jules

The original user-supplied archive is [Nimbo_Animation_Kit.zip](Nimbo_Animation_Kit.zip). It includes the README, manifest, nine emotion cutouts, 66 animation frames, and the reference concept sheet. The extracted runtime assets are already in `emotions/` and `animations/` beside this document.

Start with [INSPECTION.md](INSPECTION.md) and [inspection.json](inspection.json) for the visual defects and file hashes. Keep all sequences unapproved until repaired artwork passes visual inspection. Existing production artwork remains in `src/assets/nimbo/`.

Technical work to review:

- `src/components/nimboSequences.ts`: literal Metro mappings, approval gate, frame rates and state aliases.
- `src/components/Nimbo.tsx`: preloading, frame switching, Reanimated transitions and tap feedback, animation cancellation.
- `src/hooks/useNimboActivity.ts`: reduced motion, route focus, foreground and viewport visibility on web and native.
- `src/app/nimbo-review.tsx`: isolated development review without changing the state controller or stored data.
- `src/__tests__/nimboSequences.test.ts`: mapping, manifest, approval and playback-policy checks.

Preserve feeding, sleep tracking, work reminders, and the Nimbo state controller. Prevent stacked frame movement and Reanimated spatial movement. Verify cleanup, rapid state changes, accessibility, and native Expo Go/device behavior as well as web rendering.

The supplied sequences only translate the complete character. They contain no independent paw, eyelid, smile or yawn poses. Technical fixes alone cannot restore mask-damaged artwork or create missing articulated animation frames. The reference concept sheet is illustrative, not a layered asset source.

Run TypeScript, lint, tests and Expo Doctor after changes. Record any remaining visual defects and native-device limitations before enabling production replacements.
