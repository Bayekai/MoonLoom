import { NIMBO_STATES } from '../services/nimboStateController';
import { canTapRive, NIMBO_RIVE_STATES } from '../components/rive/nimboRiveContract';

describe('Nimbo Rive integration contract', () => {
  it('covers every domain state with a unique stable editor value', () => {
    expect(Object.keys(NIMBO_RIVE_STATES).sort()).toEqual(Object.keys(NIMBO_STATES).sort());
    expect(new Set(Object.values(NIMBO_RIVE_STATES)).size).toBe(15);
    expect(NIMBO_RIVE_STATES.NEUTRAL).toBe(0);
    expect(NIMBO_RIVE_STATES.SLEEPING).toBe(8);
    expect(NIMBO_RIVE_STATES.EATING).toBe(10);
  });
  it('does not interrupt food, settling or sleeping with a pet reaction', () => {
    for (const state of ['EATING', 'SLEEPING', 'SLEEPY'] as const) expect(canTapRive(state, true, false)).toBe(false);
    expect(canTapRive('NEUTRAL', true, false)).toBe(true);
  });
  it('never triggers a reaction offscreen or with reduced motion', () => {
    expect(canTapRive('HAPPY', false, false)).toBe(false);
    expect(canTapRive('HAPPY', true, true)).toBe(false);
  });
});
