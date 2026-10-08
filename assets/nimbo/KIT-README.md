# Nimbo animation asset starter kit

## What is included
- `emotions/`: nine PNGs extracted from the nine provided source images, with approximate dark-background removal.
- `animations/`: loop-ready frame sequences for nine states, made by applying small whole-character translations to the cutouts. These are **not** newly painted articulated poses: eyes, mouth, ears, paws and tail do not move independently.
- `reference/concept-sheet.png`: visual concept only. Its thumbnail labels, part names, and proposed frame sets are NOT actual standalone assets.

## Important quality caveat
The original images have dark backgrounds, embedded effects, and some bottom text. Automated color/mask separation is approximate and can leave dark halos, omit dark details, or retain traces of labels. Visually review all files before shipping. For production-grade clean silhouettes and separately movable body parts, commission/render transparent source art or hand-mask each pose. Do not treat the reference sheet as a source of individual high-quality layers.

## React Native usage
Use static `require()` paths for Metro. Reanimated should continue to handle floating, transitions and tap behavior. Avoid stacking frame translation and equivalent Reanimated movement at full strength. Play the loops at roughly 6-10 FPS, slower for sleeping, and pause when offscreen or app is backgrounded.

## Suggested upload
Copy `emotions/` and `animations/` into your repository under `assets/nimbo/`. Keep existing source PNGs backed up and verify appearance in Expo Go before replacing any production art.
