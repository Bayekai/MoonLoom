import { useStore, WorkBreak } from '../store/useStore';
import * as Crypto from 'expo-crypto';

export class WorkService {
  static calculateMidShift(shiftStartIso: string, shiftEndIso: string): string {
    const start = new Date(shiftStartIso).getTime();
    const end = new Date(shiftEndIso).getTime();

    // Handle cross-midnight shifts (e.g. 22:00 -> 06:00)
    let finalEnd = end;
    if (end < start) {
        finalEnd += (24 * 60 * 60 * 1000); // Add 24 hours
    }

    const mid = start + (finalEnd - start) / 2;
    return new Date(mid).toISOString();
  }

  static scheduleMidShiftBreak(shiftStartIso: string, shiftEndIso: string, durationMinutes: number = 10) {
    const midShiftIso = this.calculateMidShift(shiftStartIso, shiftEndIso);

    const workBreak: WorkBreak = {
      id: Crypto.randomUUID(),
      userId: useStore.getState().profile.id,
      scheduledTime: midShiftIso,
      durationMinutes,
      status: 'scheduled'
    };

    useStore.getState().addWorkBreak(workBreak);
    return workBreak;
  }
}