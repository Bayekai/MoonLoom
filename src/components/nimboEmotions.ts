import type { NimboState } from '../services/nimboStateController';

export const NIMBO_EMOTIONS: Record<NimboState, { response: string; tapMotion: 'happy' | 'gentle' | 'none'; artworkNeeded: string }> = {
  NEUTRAL: { response: 'Hi! I’m glad you’re here.', tapMotion: 'happy', artworkNeeded: 'Greeting ears and tail' },
  HAPPY: { response: 'That made my day!', tapMotion: 'happy', artworkNeeded: 'Smile transition and tail wag' },
  ENERGETIC: { response: 'Ready for a little play?', tapMotion: 'happy', artworkNeeded: 'Playful paws and ears' },
  CALM: { response: 'Let’s enjoy a quiet moment.', tapMotion: 'gentle', artworkNeeded: 'Relaxed ears and slow tail sway' },
  SLEEPY: { response: 'Getting cozy… let’s keep things quiet.', tapMotion: 'none', artworkNeeded: 'Yawn and drooping eyelids' },
  TIRED: { response: 'A gentle pat is just right today.', tapMotion: 'gentle', artworkNeeded: 'Tired eyelids and ears' },
  STRESSED: { response: 'Thanks for staying with me. One slow breath.', tapMotion: 'gentle', artworkNeeded: 'Worried-to-reassured expression' },
  ENCOURAGING: { response: 'One small step at a time. We’ve got this.', tapMotion: 'gentle', artworkNeeded: 'Encouraging smile and paw gesture' },
  SLEEPING: { response: 'Zzz… resting peacefully. Use “I’m Awake” when you’re ready.', tapMotion: 'none', artworkNeeded: 'Resting breath, ears and tail' },
  WAKING: { response: 'Good to see you. Give me a moment to stretch.', tapMotion: 'gentle', artworkNeeded: 'Eye opening and paw stretch' },
  EATING: { response: 'Nom… thank you! Let me finish my snack.', tapMotion: 'none', artworkNeeded: 'Head lowering and mouth chewing' },
  PLAYING: { response: 'Your turn! Another gentle tap?', tapMotion: 'happy', artworkNeeded: 'Alternating paws and play reaction' },
  CELEBRATING: { response: 'We did it! A little celebration together.', tapMotion: 'happy', artworkNeeded: 'Celebration paws and smile' },
  BREAK_TIME: { response: 'A little reset together? Your break controls are below.', tapMotion: 'gentle', artworkNeeded: 'Inviting paw gesture' },
  IMPROVING: { response: 'Little by little, we’re making progress.', tapMotion: 'happy', artworkNeeded: 'Proud smile and ear lift' },
};
