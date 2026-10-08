# Nimbo: official artwork and animation within the character

## What is verified and changed
Fetched the current default branch of [Bayekai/MoonLoom](https://github.com/Bayekai/MoonLoom), restored its nine `src/assets/nimbo/*.png` files, and matched every file against its Git blob hash. [NIMBO-ASSET-AUDIT.json](NIMBO-ASSET-AUDIT.json) records dimensions, hashes and PNG animation checks. Images are 496×285 or 496×286 RGBA PNGs. None contains an APNG animation chunk. The repository has no separate eye/mouth/paw layers, frame sequence, sprite atlas, or character rig.

`Nimbo.tsx` now renders the official image in a fixed View. Removed the whole-image translation, scaling, rotation, opacity pulsing, bounce/spring behavior, tap reactions, and all idle/transition timers. State changes still choose the appropriate official illustration; they do not move or animate it. The legacy `NimboBehavior` policy is disabled for every state, so it cannot request a hop, tilt, float or breathing-scale effect. State subscriptions, sleep, feeding and work timers remain separate from visual motion.

## How to animate paws, eyelids, smiles and yawns
Use one consistent Nimbo pose with separately exported transparent parts, preserving the official design. Keep the full scene/body anchored. Animate only the parts that change. Do not animate the PNG rectangle, and do not overlay roughly drawn shapes on the existing painted face.

| Motion | Art required | Playback approach |
| --- | --- | --- |
| Paw movement | Clean body plate, separate left/right foreleg and paw layers, hidden fur painted behind them | Rotate each limb around a defined local shoulder/wrist pivot; body and background stay fixed |
| Eyelids/blinking | Clean face plate plus open, half-closed and closed eyelid frames on a common canvas | Swap eyelid frames over roughly 120–200 ms, occasionally double-blink; start with explicit preview controls |
| Smiling | Neutral, slight-smile and full-smile mouth/cheek frames, with matching highlights/shadows | Frame sequence or small mouth-only blend; do not stretch the full head |
| Yawning | Coordinated jaw/mouth, eyes and cheek frames; optionally a separate paw near the mouth | About 8–12 painted frames over roughly 1–2 seconds, then return to the same neutral pose |

These timings/frame counts are animation design starting points, not assets already present in GitHub. A single flattened PNG cannot reveal the fur behind a lifted paw or supply an unseen closed eyelid/open jaw. Those pixels must be authored or recovered from original layered artwork. Each part should share a 496×286 reference canvas (or a higher-resolution proportional canvas), with documented origin, pivot and draw order. Avoid constructing animation by cycling the nine different full-scene pose images; their alignment, pose and backgrounds differ.

## Recommended implementation in this Expo project
The project already has Reanimated 4.5.1. After the art parts exist, use a fixed root View with absolutely positioned Image layers. Apply `useAnimatedStyle`/`withTiming` to individual paw containers or local face layers, not the root View. Painted blink/yawn sprite frames preserve this soft illustration style better than deforming the full bitmap. Preload assets, permit one facial sequence at a time, cancel on unmount, and use a static expression for reduced motion. This can reuse the existing `nimboController` for the displayed mood while an independent part-animation controller handles blink/paw/smile/yawn actions.

References checked: [Expo SDK 57 Reanimated support](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/), [Reanimated animated styles](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/), [timed animation](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/).

## First useful art handoff
Prepare a neutral pose with background, body, head/face plate, left/right paws, eyelid frame sets, and mouth/jaw expression frames. Remove embedded pose captions from these new rig layers. Start with a blinking prototype, then add a paw wave, smile and yawn. Keep the official static PNG as the fallback until each rig sequence is visually approved. No replacement artwork or fake articulated motion has been generated in this update.
