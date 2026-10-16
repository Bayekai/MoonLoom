import { SleepTrackerService } from '../services/sleepTracker';
import { useStore } from '../store/useStore';

describe('Sleep Tracker Logic', () => {
  beforeEach(() => {
    useStore.setState({ sleepSessions: [] });
    useStore.getState().updateProfile({ foodBalance: 0 });
  });

  it.each(['', '25:00', '12:65', 'abc', '08:10extra'])('rejects malformed time %s', time => {
    expect(() => SleepTrackerService.manualInterval(time, '06:00')).toThrow();
  });

  it('handles daytime sleep without adding a spurious day', () => {
    const interval = SleepTrackerService.manualInterval('09:00', '17:00', new Date(2026, 9, 16, 18));
    expect(new Date(interval.wakeTime).getTime() - new Date(interval.bedtime).getTime()).toBe(8 * 3600000);
  });

  it('uses the most recent completed overnight interval and zeroes milliseconds', () => {
    const now = new Date(2026, 9, 16, 3, 0, 0, 123);
    const interval = SleepTrackerService.manualInterval('22:00', '06:00', now);
    expect(new Date(interval.wakeTime).getDate()).toBe(15);
    expect(new Date(interval.bedtime).getDate()).toBe(14);
    expect(new Date(interval.wakeTime).getMilliseconds()).toBe(0);
  });

  it('rejects equal manual times', () => {
    expect(() => SleepTrackerService.manualInterval('06:00', '06:00')).toThrow();
  });

  it.each([
    ['invalid', '2026-10-16T08:00:00Z'],
    ['2026-10-16T08:00:00Z', '2026-10-16T07:00:00Z'],
    ['2026-10-16T08:00:00Z', '2026-10-16T08:00:00Z'],
  ])('rejects invalid intervals without granting food', (bed, wake) => {
    expect(() => SleepTrackerService.logSleep(bed, wake)).toThrow();
    expect(useStore.getState().sleepSessions).toHaveLength(0);
    expect(useStore.getState().profile.foodBalance).toBe(0);
  });

  it('persists the morning rating and awards food once', () => {
    SleepTrackerService.logSleep('2026-10-15T22:00:00Z', '2026-10-16T06:00:00Z', 'Good');
    expect(useStore.getState().sleepSessions[0].rating).toBe('Good');
    expect(useStore.getState().profile.foodBalance).toBe(2);
  });
  it('correctly calculates cross-midnight sleep durations', () => {
    // We are mocking useStore state update implicitly by just checking if logSleep creates right properties
    const bedtime = '2023-10-01T23:30:00Z'; // 11:30 PM
    const wakeTime = '2023-10-02T07:00:00Z'; // 7:00 AM

    // 7.5 hours * 60m * 60s * 1000ms
    const expectedDurationMs = 7.5 * 60 * 60 * 1000;

    const session = SleepTrackerService.logSleep(bedtime, wakeTime);

    expect(session.durationMs).toBe(expectedDurationMs);
  });
});
