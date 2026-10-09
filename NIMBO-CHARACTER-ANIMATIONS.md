# Nimbo character animation expansion

The supplied styleguide is retained at `assets/nimbo/reference/animation-behavior-reference.png` as reference only. None of its labeled thumbnails have been cropped, loaded as sprites or presented as production artwork. No new articulated layers, facial drawings or character images were generated.

## What runs now

| Behavior | Actual visible implementation | Whole-character movement | Still awaiting approved artwork |
| --- | --- | --- | --- |
| Idle | Original five-pose blink plus a small breathing scale loop | Yes, up to 1.2% | Independent ears and tail sway |
| Happy | Existing smiling static image plus two finite celebratory hops | Yes, 10 px then 6 px | Facial smile transitions and independent celebration poses |
| Eating | Original static eating/bowl image; existing feeding state flow | No | Approach, separate bowl/head movement, chewing and return poses |
| Sleeping | Original closed-eye resting image; small settle and slow breathing | Yes, 4 px settle and up to 0.8% scale | Animated curl/tail wrapping and eye-closing transition |
| Wake/stretch | Original open-eye image; brief lift, then existing wake-to-happy flow | Yes, up to 5 px | Eye-opening transition and actual paw/body stretch |
| Walking | Static development review only; runtime gait disabled | No | Coordinated alternating paw contacts, body weight shifts and all 8 gait poses |
| Tap reaction | Physical recoil, original happy static pose, small hop, return to current state | Yes | A genuinely surprised face and articulated surprise-to-smile transition |

Static smiling, eating, resting and open-eye poses are existing artwork. They are not newly animated faces or limbs. Whole-character transforms also move any background/effects painted into the original PNG. The blink retains its previously documented source defects and explicit production opt-in; it has not been falsely reclassified as approved new artwork.

## Runtime and preservation

`NimboBehavior` retains its existing public idle/timing API and adds deterministic motion profiles and availability policies. `useNimboMotion` owns Reanimated breathing, finite entry reactions and tap motion. The previous independent idle/transition/tap transform schedulers have been consolidated to prevent simultaneous competing motion. No new animation dependencies were installed.

The original blink assets, manifest, frame order and 4800/90/110/90/110 ms cadence are unchanged. Its clock runs independently of the physical motion and tap acknowledgement; a tap does not restart or pause that clock. The happy tap pose temporarily covers the underlying blinking image and then returns to its current frame. Sleeping, sleepy and eating states do not accept the awake tap reaction. Reduced motion allows only a still happy acknowledgement.

All rejected legacy loops are disabled in production and in the development review. The review displays the original static state artwork instead. New articulated animations cannot play: every artwork definition is `awaiting-approved-artwork`, has no frame sources, and has `enabled: false`.

All motion and reaction timers cancel on state change, backgrounding, loss of route focus, offscreen visibility, reduced-motion changes or unmount. Generation checks prevent stale tap callbacks from affecting a later state. Entry celebration/settle/wake motion runs once per state; returning to the viewport resumes breathing without replaying celebration. Existing foreground/visibility logic is retained. Native viewport detection can take up to 500 ms, as before.

The controller, food spending/rewards, sleep tracking, work reminders, stored data and normal navigation are untouched. The development review uses local state overrides and replay controls; it never invokes feeding/sleep actions or changes the domain controller.

## Artwork handoff for Jules

`src/components/nimboAnimationDefinitions.ts` defines all seven behaviors, intended phase timing, current fallback, completion ownership, required illustration details and expected frame counts. `assets/nimbo/animation-definitions.json` exports that contract alongside the reference hash. Regenerate it with `node scripts/export-nimbo-animation-definitions.cjs`; tests catch mismatches.

New images should use a common 704×576 RGBA canvas, consistent character scale, paw baseline and proportions. Supply either aligned painted poses or clean transparent parts with body/background plates and pivots. Keep a separate fixed bowl for independently animated eating. Do not derive missing facial or paw pixels from the styleguide thumbnails or activate the old translated cutouts. Visual approval must precede adding frame sources and enabling articulated playback.

## Validation

TypeScript, unit tests, lint, Expo diagnostics and browser simulator checks are performed for this change. Native device/Expo Go visual behavior is not certified by the web simulator. Recorded final results and screenshots accompany the commit report.

Final checks: 81 tests in 8 suites pass; TypeScript passes; lint has zero errors and one existing Home warning; Expo Doctor passes 21/21; Expo web export succeeds. Browser checks observed idle breathing scale 1.0102, happy lift -9.69 px, sleep settle -2.92 px and sleep breathing scale 1.00131, wake lift -2.73 px, and tap happy response lift -5.67 px. Eating and walking have identity spatial transforms. Reduced motion and offscreen pause reset transforms to identity. Tap acknowledgement returns to neutral and an interrupted tap does not leak into sleeping. Original static eating, smiling and resting images were inspected visually. The blink's original files and metadata and all domain service/store files have no changes in this patch. Native-device rendering remains unverified.
