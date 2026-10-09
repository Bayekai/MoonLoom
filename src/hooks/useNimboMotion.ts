/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutable animation handles. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { NimboState } from '../services/nimboStateController';
import { NimboBehavior } from '../components/NimboBehavior';

export type NimboTapPhase = 'none' | 'recoil' | 'happy';

export function useNimboMotion(state: NimboState, active: boolean, reduced: boolean, ownsSpatialMotion: boolean) {
  const profile = NimboBehavior.getMotionProfile(state);
  const moving = NimboBehavior.canAnimate(active, reduced, ownsSpatialMotion);
  const breath = useSharedValue(1);
  const lift = useSharedValue(0);
  const gestureScale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const generation = useRef(0);
  const lastEntry = useRef<NimboState | null>(null);
  const lastTap = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [reaction, setReaction] = useState<{ state: NimboState; phase: NimboTapPhase }>({ state, phase: 'none' });

  useEffect(() => {
    generation.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const reset = setTimeout(() => setReaction({ state, phase: 'none' }), 0);
    const resetMotion = () => {
      [breath, lift, gestureScale, rotate, opacity].forEach(cancelAnimation);
      breath.value = 1; lift.value = 0; gestureScale.value = 1; rotate.value = 0; opacity.value = 1;
    };
    resetMotion();
    if (moving) {
      if (profile.breathScale > 1) {
        breath.value = withRepeat(withSequence(
          withTiming(profile.breathScale, { duration: profile.breathHalfCycleMs, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: profile.breathHalfCycleMs, easing: Easing.inOut(Easing.ease) }),
        ), -1, false);
      }
      // Entry reactions are finite and occur once per state, not on every render or visibility change.
      if (lastEntry.current !== state) {
        lastEntry.current = state;
        opacity.value = withSequence(withTiming(0.8, { duration: 80 }), withTiming(1, { duration: 180 }));
        switch (profile.entry) {
          case 'celebrate':
            lift.value = withSequence(
              withTiming(-10, { duration: 180, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 220, easing: Easing.in(Easing.ease) }),
              withTiming(-6, { duration: 140, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 180, easing: Easing.in(Easing.ease) }),
            );
            break;
          case 'settle':
            lift.value = -4;
            lift.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
            break;
          case 'wake':
            lift.value = withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 350 }));
            break;
        }
      }
    }
    return () => {
      generation.current += 1;
      clearTimeout(reset);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      resetMotion();
    };
  }, [state, moving, active, reduced, profile, breath, lift, gestureScale, rotate, opacity]);

  const tap = useCallback(() => {
    if (!active || ownsSpatialMotion || !NimboBehavior.canReactToTap(state) || Date.now() - lastTap.current < 1200) return;
    lastTap.current = Date.now();
    const token = generation.current;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setReaction({ state, phase: reduced ? 'happy' : 'recoil' });
    if (!reduced) {
      // A physical recoil is not a fabricated surprised facial expression.
      [lift, gestureScale, rotate].forEach(cancelAnimation);
      gestureScale.value = withSequence(withTiming(0.985, { duration: 90 }), withTiming(1, { duration: 90 }));
      rotate.value = withSequence(withTiming(3, { duration: 90 }), withTiming(0, { duration: 90 }));
      lift.value = withDelay(180, withSequence(withTiming(-6, { duration: 180 }), withTiming(0, { duration: 220 })));
      timers.current.push(setTimeout(() => {
        if (generation.current === token) setReaction({ state, phase: 'happy' });
      }, 180));
    }
    timers.current.push(setTimeout(() => {
      if (generation.current === token) setReaction({ state, phase: 'none' });
    }, 1000));
  }, [active, ownsSpatialMotion, state, reduced, lift, gestureScale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: lift.value }, { scale: breath.value * gestureScale.value }, { rotate: `${rotate.value}deg` }],
  }));
  const tapPhase = active && reaction.state === state ? reaction.phase : 'none';
  return { animatedStyle, tap, tapPhase, moving, profile };
}
