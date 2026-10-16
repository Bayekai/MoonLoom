import { nimboActions } from '../services/nimboActions';
import { nimboController } from '../services/nimboStateController';
import { useStore } from '../store/useStore';

describe('Nimbo user action timing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    nimboActions.wake();
    jest.runAllTimers();
    nimboController.setState('NEUTRAL');
    useStore.getState().updateProfile({ foodBalance: 3 });
  });
  afterEach(() => { jest.runAllTimers(); jest.useRealTimers(); });

  it('cannot fall asleep from an old timer after waking', () => {
    nimboActions.sleep();
    jest.advanceTimersByTime(1000);
    nimboActions.wake();
    jest.advanceTimersByTime(1000);
    expect(nimboController.getState()).toBe('WAKING');
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('HAPPY');
    expect(useStore.getState().isSleeping).toBe(false);
  });

  it('ignores repeated feeding taps and consumes exactly one food', () => {
    expect(nimboActions.feed()).toBe(true);
    expect(nimboActions.feed()).toBe(false);
    expect(useStore.getState().profile.foodBalance).toBe(2);
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('NEUTRAL');
  });

  it('sleep cancels feeding callbacks and prevents feeding during sleep', () => {
    nimboActions.feed();
    nimboActions.sleep();
    expect(nimboActions.feed()).toBe(false);
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('SLEEPING');
  });

  it('does not overwrite a newer controller state', () => {
    nimboActions.feed();
    nimboController.setState('STRESSED');
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('STRESSED');
  });

  it('feeding during wake-up cannot restore a stuck transitional pose', () => {
    nimboActions.wake();
    nimboActions.feed();
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('HAPPY');
  });

  it.each(['play', 'comfort', 'encourage'] as const)('%s returns to the previous emotion without spending food', kind => {
    nimboController.setState('STRESSED');
    expect(nimboActions.interact(kind)).toBe(true);
    expect(useStore.getState().profile.foodBalance).toBe(3);
    expect(useStore.getState().isSleeping).toBe(false);
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('STRESSED');
  });

  it('social interactions cannot interrupt sleep or feeding', () => {
    nimboActions.sleep();
    expect(nimboActions.interact('play')).toBe(false);
    nimboActions.wake();
    expect(nimboActions.interact('comfort')).toBe(false);
    jest.runAllTimers();
    nimboActions.feed();
    expect(nimboActions.interact('encourage')).toBe(false);
    expect(nimboController.getState()).toBe('EATING');
  });

  it('rapidly changing social actions restores the original emotion', () => {
    nimboController.setState('STRESSED');
    nimboActions.interact('play');
    jest.advanceTimersByTime(100);
    nimboActions.interact('comfort');
    jest.advanceTimersByTime(100);
    nimboActions.interact('encourage');
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('STRESSED');
    expect(useStore.getState().profile.foodBalance).toBe(3);
  });

  it('feeding during play returns to the original emotion', () => {
    nimboController.setState('TIRED');
    nimboActions.interact('play');
    nimboActions.feed();
    jest.runAllTimers();
    expect(nimboController.getState()).toBe('TIRED');
    expect(useStore.getState().profile.foodBalance).toBe(2);
  });
});
