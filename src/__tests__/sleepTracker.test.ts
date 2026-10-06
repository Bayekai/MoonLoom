import { SleepTrackerService } from '../services/sleepTracker';

describe('Sleep Tracker Logic', () => {
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