# Blink application integration

The five supplied blink poses are integrated into the standard Nimbo component, including production builds. The user explicitly requested production use despite the documented defects. `assets/nimbo/animations/blink/manifest.json` records `productionEnabled: true` separately from the unchanged `approved: false` visual-QA status.

Neutral, calm and encouraging states use the blink. Eating, sleeping, tired, happy, energetic, stressed, break-time and other states keep their existing state artwork and behavior. The central controller, food logic, sleep records, work scheduling and stored user data are unchanged.

Metro uses five literal `require()` mappings. The open pose holds 4800 ms; half-closed, closed, reopening and open-return poses then hold 90, 110, 90 and 110 ms respectively. One timeout clock follows the next pose boundary, avoiding repeated updates during the open-eye hold. Sequence-specific load and frame keys prevent the prior neutral animation's cached frames from leaking into blink playback. Images load before playback; they use the full canvas with contain sizing and no paw/text cropping.

Frame playback suppresses spatial Reanimated idle/tap movement and cancels inherited transforms, preventing stacked movement. Reanimated continues to handle opacity transitions and tap feedback. Reduced motion uses the open still. Route focus, application foreground and viewport visibility suppress playback; resuming starts at the open pose. Layered frames are hidden from screen readers behind one stable Nimbo image label.

The existing development review screen has a BLINK option and a reduced-motion toggle. The phone wrapper opens Home by default so the applied artwork is visible in the actual application.

Validation: TypeScript passes; 67 tests across seven suites pass; lint has no errors and five existing hook/Home warnings; Expo Doctor passes 21/21; Expo web export resolves all five blink assets successfully. Browser checks verified original 704-pixel-wide frame loading, progression to the fifth pose, reduced-motion pause and offscreen pause. The existing local profile still shows 3 food and 8.0 hours average sleep. No feeding or sleep actions were used for testing. Native-device rendering remains unverified.

Known artwork limitations remain: edge fringe, source-edge clipping and body/proportion drift between poses. Production enabling is user authorization to use these imperfect assets, not a claim that they passed visual approval.
