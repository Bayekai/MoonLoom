import { NIMBO_EMOTIONS } from '../components/nimboEmotions';
import { NIMBO_STATES } from '../services/nimboStateController';
import { NimboBehavior } from '../components/NimboBehavior';

test('every controller state has a distinct response and explicit articulation requirement', () => {
  expect(Object.keys(NIMBO_EMOTIONS).sort()).toEqual(Object.keys(NIMBO_STATES).sort());
  expect(new Set(Object.values(NIMBO_EMOTIONS).map(e => e.response)).size).toBe(15);
  for (const emotion of Object.values(NIMBO_EMOTIONS)) expect(emotion.artworkNeeded.length).toBeGreaterThan(0);
});

test('rest and feeding never trigger physical tap reactions', () => {
  for (const state of ['SLEEPY', 'SLEEPING', 'EATING'] as const) {
    expect(NIMBO_EMOTIONS[state].tapMotion).toBe('none');
    expect(NimboBehavior.canReactToTap(state)).toBe(false);
  }
});

test('stressed and tired responses are gentle instead of switching to a celebration', () => {
  expect(NIMBO_EMOTIONS.STRESSED.tapMotion).toBe('gentle');
  expect(NIMBO_EMOTIONS.TIRED.tapMotion).toBe('gentle');
});
