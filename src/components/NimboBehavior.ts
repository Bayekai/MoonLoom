import type { NimboState } from '../services/nimboStateController';

// Kept as a compatibility policy, with all whole-image actions disabled.
export class NimboBehavior {
  static readonly wholeImageMotionEnabled=false;
  static getNextIdleEvent(_state:NimboState): 'none' { return 'none'; }
  static getIdleTiming(_state:NimboState):{duration:number;delay:number} { return {duration:0,delay:0}; }
}
