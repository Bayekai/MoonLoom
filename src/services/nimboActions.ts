import { useStore } from '../store/useStore';
import { nimboController, type NimboState } from './nimboStateController';

// A new user action cancels the previous action's delayed state changes.
class NimboActions {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private feeding = false;
  private social: { base: NimboState; current: NimboState } | undefined;

  private cancel() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.feeding = false;
    this.social = undefined;
  }

  reset() {
    this.cancel();
    nimboController.setState('NEUTRAL');
  }

  private after(expected: NimboState, next: () => void) {
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (nimboController.getState() === expected) next();
      else this.feeding = false;
    }, 2000);
  }

  sleep() {
    this.cancel();
    useStore.getState().setSleeping(true);
    nimboController.setState('SLEEPY');
    this.after('SLEEPY', () => nimboController.setState('SLEEPING'));
  }

  wake() {
    this.cancel();
    useStore.getState().setSleeping(false);
    nimboController.setState('WAKING');
    this.after('WAKING', () => nimboController.setState('HAPPY'));
  }

  interact(kind: 'play' | 'comfort' | 'encourage') {
    const store = useStore.getState();
    const previous = nimboController.getState();
    if (this.feeding || store.isSleeping || store.work.runtime.timer ||
        ['EATING', 'SLEEPY', 'SLEEPING', 'WAKING'].includes(previous)) return false;
    const base = this.social?.current === previous ? this.social.base : previous;
    this.cancel();
    const next = { play: 'PLAYING', comfort: 'CALM', encourage: 'ENCOURAGING' } as const;
    this.social = { base, current: next[kind] };
    nimboController.setState(next[kind]);
    this.after(next[kind], () => {
      this.social = undefined;
      nimboController.setState(base);
    });
    return true;
  }

  feed() {
    const store = useStore.getState();
    if (this.feeding || store.isSleeping || store.profile.foodBalance < 1) return false;
    const current = nimboController.getState();
    const previous = current === 'WAKING' ? 'HAPPY'
      : this.social?.current === current ? this.social.base : current;
    this.cancel();
    this.feeding = true;
    store.addFood(-1);
    nimboController.setState('EATING');
    this.after('EATING', () => {
      nimboController.setState('HAPPY');
      this.after('HAPPY', () => {
        this.feeding = false;
        nimboController.setState(previous);
      });
    });
    return true;
  }
}

export const nimboActions = new NimboActions();
