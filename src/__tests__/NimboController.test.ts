import { nimboController, NIMBO_STATES } from '../services/nimboStateController';

describe('NimboStateController', () => {
  it('initializes in NEUTRAL state', () => {
    expect(nimboController.getState()).toBe(NIMBO_STATES.NEUTRAL);
  });

  it('allows setting valid states', () => {
    nimboController.setState('HAPPY');
    expect(nimboController.getState()).toBe(NIMBO_STATES.HAPPY);

    nimboController.setState('SLEEPING');
    expect(nimboController.getState()).toBe(NIMBO_STATES.SLEEPING);
  });

  it('falls back to NEUTRAL if given an invalid intent string', () => {
    // Suppress console.warn for this test
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    nimboController.setState('SUPER_SAIYAN_MODE');
    expect(nimboController.getState()).toBe(NIMBO_STATES.NEUTRAL);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('notifies subscribers of state changes', () => {
    const mockListener = jest.fn();
    const unsubscribe = nimboController.subscribe(mockListener);

    nimboController.setState('STRESSED');
    expect(mockListener).toHaveBeenCalledWith('STRESSED');

    unsubscribe();
    nimboController.setState('CALM');
    expect(mockListener).toHaveBeenCalledTimes(1); // Should not have been called again
  });
});