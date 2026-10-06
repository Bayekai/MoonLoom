import { WorkService } from '../services/workService';

describe('Work Service Logic', () => {
  it('correctly calculates mid-shift break for standard shift', () => {
    const start = '2023-10-01T09:00:00Z'; // 9 AM
    const end = '2023-10-01T17:00:00Z';   // 5 PM

    const mid = WorkService.calculateMidShift(start, end);
    const midDate = new Date(mid);

    expect(midDate.getUTCHours()).toBe(13); // 1 PM
  });

  it('correctly calculates mid-shift break for night shift (cross-midnight)', () => {
    const start = '2023-10-01T22:00:00Z'; // 10 PM
    const end = '2023-10-02T06:00:00Z';   // 6 AM (next day)

    const mid = WorkService.calculateMidShift(start, end);
    const midDate = new Date(mid);

    expect(midDate.getUTCHours()).toBe(2); // 2 AM
  });
});