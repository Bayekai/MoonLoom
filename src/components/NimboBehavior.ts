import { NimboState } from '../services/nimboStateController';
import { animationForState, NIMBO_ANIMATION_DEFINITIONS } from './nimboAnimationDefinitions';

export interface NimboMotionProfile {
  breathScale: number;
  breathHalfCycleMs: number;
  entry: 'none' | 'celebrate' | 'settle' | 'wake';
}
const IDLE: NimboMotionProfile = { breathScale: 1.012, breathHalfCycleMs: 2200, entry: 'none' };
const HAPPY: NimboMotionProfile = { ...IDLE, entry: 'celebrate' };
const SLEEP: NimboMotionProfile = { breathScale: 1.008, breathHalfCycleMs: 3000, entry: 'settle' };
const WAKE: NimboMotionProfile = { ...IDLE, entry: 'wake' };
const EATING: NimboMotionProfile = { breathScale: 1, breathHalfCycleMs: 2200, entry: 'none' };
const TIRED: NimboMotionProfile = { breathScale: 1.009, breathHalfCycleMs: 2700, entry: 'none' };

type IdleEvent = 'breathe' | 'float' | 'tilt' | 'hop' | 'settle' | 'none';

export class NimboBehavior {
  static getMotionProfile(state: NimboState): NimboMotionProfile {
    if (state === 'TIRED' || state === 'SLEEPY') return TIRED;
    switch (animationForState(state)) {
      case 'happy': return HAPPY;
      case 'sleeping': return SLEEP;
      case 'wake': return WAKE;
      case 'eating': return EATING;
      default: return IDLE;
    }
  }

  static getAnimationDefinition(state: NimboState) {
    return NIMBO_ANIMATION_DEFINITIONS[animationForState(state)];
  }

  static canAnimate(active: boolean, reduced: boolean, ownsSpatialMotion: boolean) {
    return active && !reduced && !ownsSpatialMotion;
  }

  static canReactToTap(state: NimboState) {
    return !['SLEEPING', 'SLEEPY', 'EATING'].includes(state);
  }

  static getNextIdleEvent(state: NimboState): IdleEvent {
    const r = Math.random();
    switch (state) {
      case 'HAPPY':
      case 'ENERGETIC':
        if (r < 0.3) return 'hop';
        if (r < 0.6) return 'float';
        if (r < 0.8) return 'tilt';
        return 'breathe';

      case 'TIRED':
      case 'SLEEPY':
        if (r < 0.8) return 'breathe';
        if (r < 0.95) return 'settle';
        return 'none';

      case 'SLEEPING':
        return 'breathe';

      case 'STRESSED':
        if (r < 0.7) return 'tilt'; // nervous tilt
        return 'breathe';

      case 'BREAK_TIME':
      case 'CELEBRATING':
        if (r < 0.5) return 'hop';
        if (r < 0.8) return 'tilt';
        return 'float';

      case 'NEUTRAL':
      case 'CALM':
      default:
        if (r < 0.5) return 'breathe';
        if (r < 0.7) return 'float';
        if (r < 0.8) return 'tilt';
        if (r < 0.9) return 'hop';
        return 'settle';
    }
  }

  static getIdleTiming(state: NimboState): { duration: number, delay: number } {
    const baseDuration = 1000;
    const baseDelay = 2000;

    switch (state) {
      case 'ENERGETIC':
      case 'CELEBRATING':
        return { duration: baseDuration * 0.6, delay: baseDelay * 0.5 };
      case 'TIRED':
      case 'SLEEPY':
      case 'SLEEPING':
        return { duration: baseDuration * 1.5, delay: baseDelay * 2 };
      default:
        return { duration: baseDuration, delay: baseDelay };
    }
  }
}
