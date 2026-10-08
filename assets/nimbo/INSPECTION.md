# Nimbo animation kit inspection and integration

## Production gate: rejected

All nine cutouts and all 66 derived frames were inspected on checkerboard contact sheets. Representative poses were also composited on a light background at original resolution. Every imported sequence remains `approved: false` in `src/components/nimboSequences.ts`. Existing `src/assets/nimbo/` production PNGs were not overwritten. The new files under `assets/nimbo/` are review assets.

| Pose / sequence | Work required |
| --- | --- |
| Neutral / idle | Flat cutoff across lower paws; dark contour fringe |
| Energetic | Retained dark effect ribbons; lower character cutoff |
| Break-time | Large holes in cushion caused by masking; clipped top curl |
| Eating / eat | Dark bowl/contour fringe; clipped top curls |
| Happy | Dark edge halo; flattened lower silhouette |
| Improving | Clipped top curl; dark contour fringe |
| Sleeping / sleep | Dark ear/cloud fringe; flat cloud underside |
| Stressed | Dark fringe around fur and stress symbols |
| Tired | Dark fringe; flat lower paw silhouette |

No readable bottom labels were found in the supplied cutouts. Intentional stars, bowls, cushions, arrows and stress symbols remain. Automated masking cannot reliably distinguish dark artwork from background. `inspection.json` records dimensions, alpha ranges, bounds, SHA-256 hashes and issues for every file.

The source README and manifest were read as asset documentation, not authorization. Both explicitly say frames are whole-character translations (`articulatedFrames: false`). These files do not provide blinking, smiling, yawning or independently moving paws. Clean silhouettes and truly articulated frames need further artwork.

## Runtime

All nine sequences use literal Metro `require()` mappings. Fifteen controller states resolve through the existing state-to-art mapping. Frame cadence is 8 FPS, sleeping 4 FPS. All frames in the selected sequence load before playback; resident image layers avoid asynchronous source swaps. Contain sizing preserves each canvas aspect ratio.

Production uses the original artwork while approval is false. Explicit `reviewKit` is accepted only in development; `/nimbo-review` does not change controller state, food, sleep records or preferences. The wrapper has a Nimbo asset review button. The production route shows an unavailable message.

Reanimated handles brief opacity transitions and tap feedback. It does not apply additional scale, translation, rotation, breathing or bounce; the supplied frames already move the character. The existing disabled whole-image idle policy stays intact. Interaction temporarily pauses frames; timers and Reanimated animations are cancelled on cleanup. System reduced motion is queried conservatively and tracked live; it stops frame playback and transitions. The review includes a reduced-motion toggle for verification.

Viewport visibility is observed with IntersectionObserver on web. Native measures bounds against the window every 500 ms while foreground and focused (up to 500 ms pause latency). Route focus, AppState, and web document visibility independently suppress playback. Hidden playback restarts at frame one on return, avoiding catch-up bursts.

## Validation

- TypeScript: pass.
- Jest: 68 tests across 7 suites pass, including controller, sleep, work, static asset mappings, manifest counts, approval gate, frame wrapping and playback suppression.
- Lint: no errors; one existing unused `sleepSessions` warning in Home.
- Expo Doctor: 21/21 checks passed.
- Expo web export: succeeds with static animation assets resolved by Metro.
- Native device visual inspection / Expo Go: not performed; no configured device or emulator is available.

The prior work-shift changes were saved separately in commit 38a43cf before this integration, preserving the existing local functionality.

Browser verification: all nine sequences rendered and advanced frames; reduced-motion preview stopped at frame one; scrolling the character offscreen stopped playback. No browser runtime errors observed. These checks do not certify native device rendering.
