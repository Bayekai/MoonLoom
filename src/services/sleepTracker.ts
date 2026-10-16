import { useStore, SleepSession } from '../store/useStore';
import * as Crypto from 'expo-crypto';

export class SleepTrackerService {
  static manualInterval(bedtime: string, wakeTime: string, now = new Date()) {
    const parse = (value: string) => {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim())) {
        throw new Error('Enter valid times in HH:MM format (00:00–23:59).');
      }
      return value.trim().split(':').map(Number);
    };
    const [bh, bm] = parse(bedtime), [wh, wm] = parse(wakeTime);
    if (bh === wh && bm === wm) throw new Error('Bedtime and wake time must be different.');
    const wake = new Date(now);
    wake.setHours(wh, wm, 0, 0);
    if (wake > now) wake.setDate(wake.getDate() - 1);
    const bed = new Date(wake);
    bed.setHours(bh, bm, 0, 0);
    if (bed >= wake) bed.setDate(bed.getDate() - 1);
    return { bedtime: bed.toISOString(), wakeTime: wake.toISOString() };
  }

  static logSleep(bedtimeIso: string, wakeTimeIso: string, rating?: string) {
    const start = new Date(bedtimeIso).getTime();
    const end = new Date(wakeTimeIso).getTime();
    const durationMs = end - start;
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      throw new Error('Wake time must be after a valid bedtime.');
    }

    const session: SleepSession = {
      id: Crypto.randomUUID(),
      userId: useStore.getState().profile.id,
      bedtime: bedtimeIso,
      wakeTime: wakeTimeIso,
      durationMs,
      rating,
    };

    useStore.getState().addSleepSession(session);
    // Reward for logging
    useStore.getState().addFood(2);
    return session;
  }

  static getAverageDurationMs(): number {
    const sessions = useStore.getState().sleepSessions;
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((acc, s) => acc + s.durationMs, 0);
    return total / sessions.length;
  }
}
