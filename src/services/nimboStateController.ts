export const NIMBO_STATES = {
  NEUTRAL: 'NEUTRAL',
  HAPPY: 'HAPPY',
  ENERGETIC: 'ENERGETIC',
  CALM: 'CALM',
  SLEEPY: 'SLEEPY',
  TIRED: 'TIRED',
  STRESSED: 'STRESSED',
  ENCOURAGING: 'ENCOURAGING',
  SLEEPING: 'SLEEPING',
  WAKING: 'WAKING',
  EATING: 'EATING',
  PLAYING: 'PLAYING',
  CELEBRATING: 'CELEBRATING',
  BREAK_TIME: 'BREAK_TIME'
} as const;

export type NimboState = keyof typeof NIMBO_STATES;

class NimboStateController {
  private currentState: NimboState = NIMBO_STATES.NEUTRAL;
  private listeners: ((state: NimboState) => void)[] = [];

  setState(intent: string) {
    if (intent in NIMBO_STATES) {
      this.currentState = intent as NimboState;
    } else {
      console.warn(`Intent ${intent} mapped to NEUTRAL as fallback.`);
      this.currentState = NIMBO_STATES.NEUTRAL;
    }
    this.notify();
  }

  getState(): NimboState {
    return this.currentState;
  }

  subscribe(listener: (state: NimboState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentState));
  }
}

export const nimboController = new NimboStateController();