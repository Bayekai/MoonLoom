# Nimbo emotion interactions

All 15 controller states now have individual tap responses. Happy/energetic/play/
celebration/progress use the existing short happy reaction. Calm, tired, stressed,
encouraging, waking and break states use a gentle whole-character tilt while
preserving the current facial artwork. Resting and eating respond through text
without interrupting their domain state. Reduced motion preserves text responses
and suppresses physical motion; inactive/offscreen pets ignore taps.

Home adds Play, Comfort and Encourage. These transient reactions restore the
previous emotion, consume no food, and cannot interrupt sleep, waking, feeding or
an active work break. New user actions cancel stale reactions. The development
emotion review exposes all 15 states without editing production data.

## Still needed for fully articulated animation

This is interaction coverage, not completion of all illustrated animation.
`src/components/nimboEmotions.ts` records the artwork needed for each emotion.
The existing Rive candidate only rigs idle ears/tail/chest plus the five-frame
blink. It remains unapproved and disabled for production. New artwork must match
Nimbo's approved design and provide clean body plates, separate paws, eye/eyelid
and mouth variants, plus ear/tail pivots. No reference-sheet crops, rejected legacy
loops, fake chewing or translated fixed-paw walking are enabled.

Next rigging work: use those approved parts to author the 15-state Rive machine,
preserve the existing NimboModel numeric contract, add true jaw/eyelid/paw motion,
validate all transitions and reduced motion, then test on Android before enabling.
The present implementation does not claim those missing movements are finished.
