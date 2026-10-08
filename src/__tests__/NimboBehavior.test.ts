import { NimboBehavior } from '../components/NimboBehavior';
import { NIMBO_STATES, NimboState } from '../services/nimboStateController';
import { getNimboAssetKey } from '../components/nimboAssets';
describe('Nimbo motion policy',()=>{
  it.each(Object.keys(NIMBO_STATES) as NimboState[])('disables whole-image actions for %s',state=>{
    expect(NimboBehavior.wholeImageMotionEnabled).toBe(false);
    expect(NimboBehavior.getNextIdleEvent(state)).toBe('none');
    expect(NimboBehavior.getIdleTiming(state)).toEqual({duration:0,delay:0});
  });
  it('keeps official artwork selection while removing motion',()=>{
    expect(getNimboAssetKey('SLEEPING')).toBe('SLEEPING');
    expect(getNimboAssetKey('BREAK_TIME')).toBe('BREAK_TIME');
    expect(getNimboAssetKey('SLEEPY')).toBe('TIRED');
    expect(getNimboAssetKey('CELEBRATING')).toBe('ENERGETIC');
    expect(getNimboAssetKey('WAKING')).toBe('NEUTRAL');
  });
  it('falls back to neutral for unknown states without animating',()=>{
    expect(getNimboAssetKey('UNKNOWN_STATE' as NimboState)).toBe('NEUTRAL');
    expect(NimboBehavior.getNextIdleEvent('UNKNOWN_STATE' as NimboState)).toBe('none');
  });
});
