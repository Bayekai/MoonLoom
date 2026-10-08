# Application integration update

The user explicitly enabled this blink in production despite the known defects. `approved` remains false; `productionEnabled` is true. Neutral, calm and encouraging states use the five-frame sequence; other states retain their existing artwork. The open pose holds 4.8 seconds, followed by a 400 ms blink. Preloading, reduced motion, route focus and foreground/offscreen pausing remain active. Spatial Reanimated movement is suppressed while the frame sequence plays to avoid stacking animations. Reanimated still handles opacity transitions and tap feedback. The extraction report below describes the original import and its unresolved visual defects.

# Nimbo blink extraction — not approved for production

Five original poses are stored as `blink-01.png` through `blink-05.png`, in reading order: top row left-to-right (open, half-closed, closed), then bottom row left-to-right (reopening, open return). `manifest.json` specifies ordering, source rectangles, normalization transforms, approval status, hashes and per-frame defects. No timing or runtime integration is added.

All frames are 704×576 RGBA with true alpha. Approximate character width is normalized to 512 pixels using uniform scaling, with the estimated middle-front-paw baseline aligned at (352,552). Aspect ratios are preserved except subpixel integer raster rounding. This does not repair the source's intrinsic differences in body proportions and silhouette.

## Safe cleanup

Final frames come from the original `source-sheet.png`, preserved here for provenance. After conservative crop extraction and resampling, only disconnected islands of at most 512 pixels were cleared when every pixel lay outside a 24-pixel protected band around the main connected silhouette. All main-character and adjacent fringe pixels were retained. The per-frame removal counts are in the manifest. No color-keying, erosion, fur reconstruction or facial repainting was applied.

A built-in imagegen background-cleanup candidate was inspected and rejected because it still retained artifacts. It was not used for the final frames. The cleanup prompt requested background-only extraction, removal of isolated distant speckles, unchanged character details and layout, and retention of ambiguous glow/fur pixels. Deterministic extraction and canvas normalization used Sharp; inspection used Pillow without modifying the assets.

## Remaining defects

- All frames retain pale/white fringe and flecks connected to or near pale fur and glow. Color-based removal could erase Nimbo.
- Top-row curls reach the original sheet's top boundary. Some details are already clipped; transparent padding cannot restore them.
- Top-row paws meet the row seam. The conservative extraction boundary and source seam require manual silhouette review before approval.
- Bottom-row paws/glow meet the original bottom boundary, so missing edge pixels cannot be recovered safely.
- Frames 04 and 05 are intrinsically wider and shorter than the top row. Uniform size normalization and baseline alignment leave visible head/body drift. Stable blink animation requires corrected source poses or carefully authored matching artwork.
- The source character interiors are mostly alpha 253/255, rather than fully opaque. This near-opacity was preserved; it is not evidence of a painted background or automatically repaired.

No readable text or rectangular opaque background was found in the five extracted frames. Inspection covered checkerboard, dark and light backgrounds. Alpha checks confirmed mode RGBA, identical dimensions, transparent pixels, no nontransparent pixel on the new canvas boundary, and recorded partial-alpha counts in `alpha-inspection.json`. All five frames remain unapproved. Production is explicitly disabled in the manifest; no application or animation mapping was changed.

## Repository preservation

The branch was refreshed to `b9b9a4c` before this import. That revision had deleted and ignored the entire tracked `assets/` directory, including the previously uploaded kit and app icons. Those existing files were restored byte-for-byte from `402bbe5` and the broad `assets/` ignore rule removed. The newer Nimbo behavior code was preserved.
