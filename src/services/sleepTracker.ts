import { useStore, SleepSession } from '../store/useStore';
import * as Crypto from 'expo-crypto';

export class SleepTrackerService {
  static logSleep(bedtimeIso: string, wakeTimeIso: string) {
    const start = new Date(bedtimeIso).getTime();
    const end = new Date(wakeTimeIso).getTime();
    const durationMs = end - start;

    const session: SleepSession = {
      id: Crypto.randomUUID(),
      userId: useStore.getState().profile.id,
      bedtime: bedtimeIso,
      wakeTime: wakeTimeIso,
      durationMs,
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
