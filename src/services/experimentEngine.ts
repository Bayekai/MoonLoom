import { useStore, Experiment } from '../store/useStore';
import * as Crypto from 'expo-crypto';

export class ExperimentEngine {
  static startExperiment(variable: string, durationDays: number) {
    const exp: Experiment = {
      id: Crypto.randomUUID(),
      userId: useStore.getState().profile.id,
      variable,
      durationDays,
      startDate: new Date().toISOString(),
      status: 'active'
    };
    useStore.getState().addExperiment(exp);
    return exp;
  }

  static concludeExperiment(id: string, averageSleepDiff: number, morningRatingDiff: number) {
    const conclusion = (averageSleepDiff > 0 && morningRatingDiff > 0)
      ? "This appears beneficial for you based on the data."
      : "This experiment did not show significant positive outcomes in our observations.";

    useStore.getState().updateExperiment(id, {
      status: 'completed',
      results: {
        averageSleepDiff,
        morningRatingDiff,
        conclusion
      }
    });
  }
}