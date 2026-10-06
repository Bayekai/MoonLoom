import { useStore, AIMemory } from '../store/useStore';
import * as Crypto from 'expo-crypto';

export class AIService {
  static recordContext(context: string) {
    const memory: AIMemory = {
      id: Crypto.randomUUID(),
      userId: useStore.getState().profile.id,
      context,
      timestamp: new Date().toISOString()
    };
    useStore.getState().addMemory(memory);
  }

  // Clean interface placeholder for LLM intent generation
  static generateIntent(userInput: string): string {
    const input = userInput.toLowerCase();
    if (input.includes('sleep') || input.includes('bed')) return 'SLEEPY';
    if (input.includes('good') || input.includes('great')) return 'HAPPY';
    if (input.includes('tired') || input.includes('exhausted')) return 'TIRED';
    if (input.includes('stress')) return 'STRESSED';
    return 'NEUTRAL';
  }

  static explainPattern(averageSleep: number): string {
    return `I noticed your stronger mornings usually follow around ${averageSleep.toFixed(1)} hours of sleep.`;
  }
}