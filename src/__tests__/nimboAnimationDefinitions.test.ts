import { NIMBO_ANIMATION_DEFINITIONS, animationForState } from '../components/nimboAnimationDefinitions';
import { NimboBehavior } from '../components/NimboBehavior';
import { NIMBO_STATES } from '../services/nimboStateController';
import fs from 'fs';
import path from 'path';

describe('Animation availability and motion ownership',()=>{
  test('Jules asset definitions match the runtime availability contract',()=>{
    const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../assets/nimbo/animation-definitions.json'),'utf8'));
    expect(manifest.animations).toEqual(NIMBO_ANIMATION_DEFINITIONS);
    expect(manifest.artworkPlaybackEnabled).toBe(false);
    expect(manifest.reference.role).toContain('reference-only');
  });
  test.each(Object.values(NIMBO_ANIMATION_DEFINITIONS))('$id never activates missing articulated artwork',definition=>{
    expect(definition.artwork.status).toBe('awaiting-approved-artwork');
    expect(definition.artwork.enabled).toBe(false);
    expect(definition.artwork.frameOrder).toEqual([]);
    expect(definition.phases.some(phase=>phase.requiresArtwork)).toBe(true);
    expect(definition.artwork.requiredDetails.length).toBeGreaterThan(0);
  });
  test('walking has no fake sliding-body fallback',()=>{
    const walking=NIMBO_ANIMATION_DEFINITIONS.walking;
    expect(walking.status).toBe('awaiting-approved-artwork');
    expect(walking.wholeCharacterMovement).toBe(false);
    expect(walking.artwork.expectedFrames).toBe(8);
    expect(walking.phases.every(phase=>phase.requiresArtwork)).toBe(true);
  });
  test('eating does not move the bowl and head as one image to fake chewing',()=>{
    expect(NimboBehavior.getMotionProfile('EATING').breathScale).toBe(1);
    expect(NimboBehavior.getMotionProfile('EATING').entry).toBe('none');
    expect(NIMBO_ANIMATION_DEFINITIONS.eating.phases.every(phase=>phase.requiresArtwork)).toBe(true);
  });
  test('motion stops for hidden, reduced-motion and spatially animated frame sequences',()=>{
    expect(NimboBehavior.canAnimate(true,false,false)).toBe(true);
    expect(NimboBehavior.canAnimate(false,false,false)).toBe(false);
    expect(NimboBehavior.canAnimate(true,true,false)).toBe(false);
    expect(NimboBehavior.canAnimate(true,false,true)).toBe(false);
  });
  test('tap acknowledgement does not interrupt sleeping or eating',()=>{
    expect(NimboBehavior.canReactToTap('SLEEPING')).toBe(false);
    expect(NimboBehavior.canReactToTap('SLEEPY')).toBe(false);
    expect(NimboBehavior.canReactToTap('EATING')).toBe(false);
    expect(NimboBehavior.canReactToTap('NEUTRAL')).toBe(true);
  });
  test('gentle breathing is bounded and slower during sleep',()=>{
    const idle=NimboBehavior.getMotionProfile('NEUTRAL');
    const sleep=NimboBehavior.getMotionProfile('SLEEPING');
    expect(idle.breathScale).toBeLessThanOrEqual(1.015);
    expect(sleep.breathScale).toBeLessThan(idle.breathScale);
    expect(sleep.breathHalfCycleMs).toBeGreaterThan(idle.breathHalfCycleMs);
    expect(sleep.entry).toBe('settle');
    expect(NimboBehavior.getMotionProfile('WAKING').entry).toBe('wake');
  });
  test('all existing states keep a supported definition and finite entry policy',()=>{
    for(const state of Object.keys(NIMBO_STATES) as (keyof typeof NIMBO_STATES)[]){
      expect(NIMBO_ANIMATION_DEFINITIONS[animationForState(state)]).toBeDefined();
      expect(['none','celebrate','settle','wake']).toContain(NimboBehavior.getMotionProfile(state).entry);
    }
    expect(NimboBehavior.getMotionProfile('HAPPY').entry).toBe('celebrate');
    expect(NimboBehavior.getMotionProfile('CELEBRATING').entry).toBe('celebrate');
  });
});
