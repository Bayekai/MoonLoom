# Nimbo Rive development setup

## Current status

Rive native/web runtimes and Expo development-client configuration are installed.
**There is no Nimbo `.riv` file yet. No articulated Rive animation is enabled or
visually validated.** The supplied PNGs and reference sheets are flattened images,
not an editable character rig. Rive does not automatically reconstruct hidden paw,
eyelid or mouth details. The current artwork, blink sequence, Reanimated raster
behavior, feeding, sleep tracking and state controller remain intact.

The Rive editor account and Expo build account require user sign-in. This Windows
machine has no Android SDK/JDK or native emulator configured; a cloud EAS build is
the prepared path. TypeScript/bundling checks do not establish native binary compatibility.

## Development build

- `npm run build:android:dev`: EAS internal Android development APK.
- `npm run build:ios:simulator`: EAS iOS simulator build; running it requires macOS.
- `npm run start:dev`: launches Metro with the development variant on Windows/macOS/Linux.
- First authenticate with `npx eas-cli@latest login`, then initialize/link the
  intended Expo project with `npx eas-cli@latest init` before building.
- The development variant is `MoonLoom (Dev)`, identifier
  `com.bayekai.moonloom.dev`. Production identifiers are not changed or invented.
- EAS project ownership, signing credentials and build output have not yet been
  established. No APK has been produced. Expo Go cannot run the Rive native module.
- Native folders stay generated through Expo CNG. Metro recognizes `.riv` assets.

## Rig authoring contract

Create a transparent, consistently aligned Nimbo artboard, named `Nimbo`, with
state machine `NimboBehavior`. Assign default view model `NimboModel` to that
artboard and author data bindings (not deprecated state-machine input APIs):

| Property | Type | Purpose |
| --- | --- | --- |
| `state` | number | Application's existing semantic state |
| `reducedMotion` | boolean | Stable, nonmoving presentation |
| `tap` | trigger | Surprise/happy reaction; must not change domain state |

State values are explicitly defined in `src/components/rive/nimboRiveContract.ts`:
NEUTRAL=0, HAPPY=1, ENERGETIC=2, CALM=3, SLEEPY=4, TIRED=5, STRESSED=6,
ENCOURAGING=7, SLEEPING=8, WAKING=9, EATING=10, PLAYING=11, CELEBRATING=12,
BREAK_TIME=13, IMPROVING=14. The controller remains the owner of feeding and sleep
transitions. Do not bind Rive events to food spending or sleep persistence.

Use existing artwork only where mesh deformation remains convincing. Independent
paw movement, chewing and newly exposed details require properly illustrated and
approved parts. Do not manufacture hidden anatomy or repurpose reference-sheet
thumbnails. Preserve the existing blink's appearance and timing; any blink authored
inside Rive must replace, rather than stack over, raster playback. Embed images in
the export so the native app works offline. Inspect alpha edges, clipping, paws,
eye shapes, mouth, mesh distortion and pose drift on contrasting backgrounds.

## Activating a validated export

1. Save the real export as `assets/nimbo/rive/nimbo.riv` and retain the editable
   Rive project URL and artwork inspection results in the manifest.
2. Change `NIMBO_RIVE_ASSET` from null to a **literal**
   `require('../../../assets/nimbo/rive/nimbo.riv')`. Never create an empty or sample
   file to satisfy this mapping.
3. Validate the full contract and all states in the Rive editor, native development
   build and web renderer. Set manifest `file`, `approved` and `enabled` only after
   those checks pass.
4. Check foreground/offscreen pause, reduced motion, tap guards, aspect ratio,
   error fallback, feeding and sleep behavior. Test eating/sleeping without spending
   real user food or changing their saved sessions.

The runtime adapter replaces the raster component exclusively. Reduced motion or
load/runtime failure uses the original raster fallback; review routes retain their
existing inspection controls. Rive alone owns character deformation while selected,
avoiding two simultaneous body/eyelid animations. Native bindings use asynchronous
view-model APIs. Offscreen activity is supplied by the existing visibility hook.

## Verification of this setup

- TypeScript: passed.
- ESLint: no errors; existing unused `sleepSessions` warning in Home.
- Unit tests: 84 passed across 9 suites.
- Expo Doctor: 21/21 passed.
- Web export: passed with a separate lazy Rive canvas bundle.
- Android JavaScript export: passed, including Hermes bytecode compilation.
- Web simulator: existing blink and breathing render; reduced motion pauses both.
- Expo config introspection: development variant and plugins resolve.
- Actual Rive artwork, native installation and articulated animation: pending;
  do not describe these as complete based on the setup checks above.

Official references: [Rive Expo setup](https://rive.app/docs/runtimes/react-native/adding-rive-to-expo),
[Rive bones and image meshes](https://rive.app/docs/editor/manipulating-shapes/bones),
[Expo build profiles](https://docs.expo.dev/build/eas-json/).
