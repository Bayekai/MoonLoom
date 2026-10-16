# Idle Rive candidate — not production approved

Editor: https://editor.rive.app/file/untitled/2642039

The candidate embeds the five existing blink PNGs without raster editing. Every
image uses the same 17 × 17 mesh and five bind-pose bones. Local influences are
limited to the ears, tail and chest; the remaining body and paws have fixed weights.
There are no fabricated anatomical layers or reference-sheet sprite crops.

## Verified locally

- Transparent artboard with no background fill, visible in the editor checkerboard.
  Source PNGs are RGBA, with alpha range 0–255. CLI screenshots composite onto the
  viewer's opaque dark background; their alpha is not an export transparency test.
- 704 × 576 canvas, image center (352, 288), unchanged scale.
- Existing blink order and durations: 4800, 90, 110, 90, 110 ms (5200 ms cycle).
- Separate idle timeline: localized left/right ear motion, tail sway and chest
  breathing. No whole-character translation or rotation is authored.
- At 1.1s, image comparisons show changes in ear, tail and chest regions. The
  paw-floor band (x=200–500, y=540–576) differs at only one anti-aliased pixel.
- Closed-eye pose renders at 4.95s. Mesh follows each existing pose.
- `reducedMotion=true` selects still eyes and still mesh. Captures at 1s and 5s
  have identical SHA-256:
  `66438a8c51136571e74130685b60aaa1f3e3085f7c414de670f61c22e9219146`.
- CLI `--verify` passes and `inspect --summary` reports no problems. Editor state
  machine playback shows both layers running.

## Known defects and outstanding work

- Existing blink artwork retains edge fringes, pose/proportion drift and a small
  detached golden line near the paw baseline. These were previously flagged; the
  Rive prototype does not repair or approve them.
- Smooth mesh deformation is limited to small motions. It does not reveal hidden
  body plates or create separate movable paws, eyelids or mouths.
- Happy expression, chewing, lying/resting pose, paw stretch, coordinated walking
  and tap expression remain awaiting approved artwork/rigging.
- `state` and `tap` are reserved view-model fields; this prototype does not animate
  those behaviors. Reduced motion is wired and verified.
- Web Rive renders this candidate in MoonLoom's isolated development review route.
  Reduced motion switches to the stable original pose. The candidate and raster
  body engines are mutually exclusive.
- The Android development build is installed. The user reports blinking with
  “Rive candidate active”, but could not see the original small ear/tail motion.
  Native mesh movement is still awaiting confirmation.
- Increased ear rotation peaks to -0.09/0.06 and 0.07/-0.05 radians and tail
  rotation to ±0.14 radians for visibility at the 240 × 197 display size.
  Local CLI captures at 0s and 1.1s show ear and tail changes; the paw-floor
  band still differs at only one pixel by one channel value. Reduced-motion
  captures at 1s/5s retain the identical SHA-256 recorded above.
- Manifest `approved` and `enabled` remain false; static production mapping remains
  null. The original Nimbo renderer, blink, feeding and sleep behavior stay active.

## Rebuild

Install the official [Rive CLI](https://github.com/rive-app/rive-docs/blob/main/cli/getting-started.mdx).
From the repository root:

```text
node assets/nimbo/rive/source/generate.mjs
rive assets/nimbo/rive/source --verify
rive inspect assets/nimbo/rive/source --summary
rive assets/nimbo/rive/source --once
```

The generator references the existing blink PNGs directly. It does not alter them.
The CLI may assign editor IDs to the generated RML. To produce the editable `.rev`,
use `--once --rev=assets/nimbo/rive/nimbo-idle-candidate.rev` after Rive CLI login.
`rive push` updates the linked working file; builds alone do not upload anything.
