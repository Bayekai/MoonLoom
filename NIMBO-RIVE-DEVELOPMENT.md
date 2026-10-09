# Nimbo Rive development setup

## Current status

Rive native/web runtimes and Expo development-client configuration are installed.
**An unapproved idle mesh prototype now exists as `nimbo-idle-candidate.riv`, with
editable `.rev` and RML source. It is not enabled in the app.** It compiles and
renders locally and plays in the [Rive editor](https://editor.rive.app/file/untitled/2642039).
It preserves the original five-frame blink and adds localized ear/tail/chest mesh
movement. Paw position remains anchored. Reduced-motion captures at 1s and 5s are
identical. See `assets/nimbo/rive/INSPECTION.md` for limitations.

The supplied PNGs and reference sheets are flattened images,
not an editable character rig. Rive does not automatically reconstruct hidden paw,
eyelid or mouth details. The current artwork, blink sequence, Reanimated raster
behavior, feeding, sleep tracking and state controller remain intact.

The Rive editor/CLI and Expo CLI are signed in. Expo project
`@bayekai/moonloom` is linked, ID `9122c18b-b5ba-4c3c-83e9-534fb8daec83`. This Windows
machine has no Android SDK/JDK or native emulator configured; a cloud EAS build is
the prepared path. TypeScript/bundling checks do not establish native binary compatibility.

## Development build

- `npm run build:android:dev`: EAS internal Android development APK.
- `npm run build:ios:simulator`: EAS iOS simulator build; running it requires macOS.
- `npm run start:dev`: launches Metro with the development variant on Windows/macOS/Linux.
- Expo project linking is configured. Other contributors authenticate with
  `npx eas-cli@latest login` using an account that can access that project.
- The development variant is `MoonLoom (Dev)`, identifier
  `com.bayekai.moonloom.dev`. Production identifiers are not changed or invented.
- EAS has generated Android signing credentials for this development app. The
  first cloud build failed at dependency installation: Nitro 0.37.1 was outside
  Rive 0.5.4's required `>=0.35.10 <0.37`. Nitro is now pinned to 0.36.5 and
  strict `npm ci --dry-run --include=dev` passes. The retry succeeded:
  https://expo.dev/accounts/bayekai/projects/moonloom/builds/ccb1d94c-c129-4457-918e-14d98d97bbda
  Expo Go cannot run the Rive native module.
- Native folders stay generated through Expo CNG. Metro recognizes `.riv` assets.
- Expo Asset embeds the candidate in development builds and supplies a local file
  URI to native Rive. The web adapter resolves its URL through Expo Asset too.
- `/nimbo-rive-review` is a hidden development-only review route, linked from
  `/nimbo-review`. It previews the candidate without changing domain state or data.
  Production keeps its original renderer. Local screenshots, editable rig source,
  `.rev` exports and the archive kit are excluded from the EAS upload.

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

1. Complete native and full animation validation of the candidate, or save a
   replacement as `assets/nimbo/rive/nimbo.riv`, and retain the editable
   Rive project URL and artwork inspection results in the manifest.
2. Change `NIMBO_RIVE_ASSET` from null to a **literal**
   `require('../../../assets/nimbo/rive/nimbo.riv')`. Never create an empty or sample
   file to satisfy this mapping.
3. Validate the full contract and all states in the Rive editor, native development
   build and web renderer. Set manifest `file`, `approved` and `enabled` only after
   those checks pass.
   Only states listed in manifest `supportedStates` use the rig; unsupported states
   keep the original renderer. The current prototype supports idle variants only.
   `state` and `tap` are reserved properties, not implemented character behaviors.
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
- Unit tests: 85 passed across 9 suites.
- Expo Doctor: 21/21 passed.
- Web export: passed with a separate lazy Rive canvas bundle.
- Android JavaScript export: passed, including Hermes bytecode compilation.
- Web simulator: existing blink and breathing render; reduced motion pauses both.
  The new Rive candidate renders in the app review route with no raster body motion;
  reduced motion switches to the stable original pose.
- Expo config introspection: development variant and plugins resolve.
- Rive CLI 1.5.1: verified scene, no inspection problems; headless blink/mesh
  captures pass; reduced-motion still captures match. Saved editor prototype plays.
- Native installation, complete state behavior and production approval: pending;
  do not describe these as complete based on the setup checks above.

## Android phone check

1. Open the successful build link above on the Android phone and install the APK.
2. Keep the phone and development computer on the same Wi-Fi.
3. Start `npm run start:dev -- --port 8090 --lan` on the computer. Open MoonLoom
   (Dev) and connect to the server URL printed by Metro. At the current setup it
   is `http://192.168.1.2:8090`; this address can change with the network.
4. On Home, tap **Rive animation preview (development)**. Check blink, ear/tail/chest
   motion, reduced motion and scrolling out of view. This review does not spend
   food or edit sleep tracking. Native visual approval is still awaiting this check.

Official references: [Rive Expo setup](https://rive.app/docs/runtimes/react-native/adding-rive-to-expo),
[Rive bones and image meshes](https://rive.app/docs/editor/manipulating-shapes/bones),
[Expo build profiles](https://docs.expo.dev/build/eas-json/).
