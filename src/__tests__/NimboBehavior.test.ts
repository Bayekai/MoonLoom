import { NimboBehavior } from '../components/NimboBehavior';
import { NimboState } from '../services/nimboStateController';

describe('NimboBehavior Engine', () => {
  it('returns valid idle events', () => {
    const event = NimboBehavior.getNextIdleEvent('NEUTRAL');
    const validEvents = ['breathe', 'float', 'tilt', 'hop', 'settle', 'none'];
    expect(validEvents).toContain(event);
  });

  it('adjusts idle timing based on state', () => {
    const energeticTiming = NimboBehavior.getIdleTiming('ENERGETIC');
    const tiredTiming = NimboBehavior.getIdleTiming('TIRED');
    const neutralTiming = NimboBehavior.getIdleTiming('NEUTRAL');

    // Energetic should be faster than Neutral
    expect(energeticTiming.duration).toBeLessThan(neutralTiming.duration);
    expect(energeticTiming.delay).toBeLessThan(neutralTiming.delay);

    // Tired should be slower than Neutral
    expect(tiredTiming.duration).toBeGreaterThan(neutralTiming.duration);
    expect(tiredTiming.delay).toBeGreaterThan(neutralTiming.delay);
  });

  it('never returns an invalid state', () => {
    // TypeScript ensures valid states, but we check the logic handles edge cases
    const event = NimboBehavior.getNextIdleEvent('UNKNOWN_STATE' as NimboState);
    const validEvents = ['breathe', 'float', 'tilt', 'hop', 'settle', 'none'];
    expect(validEvents).toContain(event);
  });
});