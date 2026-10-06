import { NimboState } from '../services/nimboStateController';

type IdleEvent = 'breathe' | 'float' | 'tilt' | 'hop' | 'settle' | 'none';

export class NimboBehavior {
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
