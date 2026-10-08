/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Pressable } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring, runOnJS, Easing } from 'react-native-reanimated';
import { nimboController, NimboState } from '../services/nimboStateController';
import { getNimboAssetKey } from './nimboAssets';
import { canUseSequence, getDisplayedNimboSequence, sequenceClock, shouldPlay } from './nimboSequences';
import { useNimboActivity } from '../hooks/useNimboActivity';
import { NimboBehavior } from './NimboBehavior';

const NIMBO_ASSETS: Record<string, ImageSourcePropType> = {
  BREAK_TIME: require('../assets/nimbo/nimbo-break-time.png'),
  EATING: require('../assets/nimbo/nimbo-eating.png'),
  ENERGETIC: require('../assets/nimbo/nimbo-energetic.png'),
  HAPPY: require('../assets/nimbo/nimbo-happy.png'),
  IMPROVING: require('../assets/nimbo/nimbo-improving.png'),
  NEUTRAL: require('../assets/nimbo/nimbo-neutral.png'),
  SLEEPING: require('../assets/nimbo/nimbo-sleeping.png'),
  STRESSED: require('../assets/nimbo/nimbo-stressed.png'),
  TIRED: require('../assets/nimbo/nimbo-tired.png'),
};

const subscribe = (notify: () => void) => nimboController.subscribe(() => notify());
const snapshot = () => nimboController.getState();

export function Nimbo({ reviewKit = false, reviewState, reviewReduced = false, reviewBlink = false }: { reviewKit?: boolean; reviewState?: NimboState; reviewReduced?: boolean; reviewBlink?: boolean }) {
  const current = useSyncExternalStore(subscribe, snapshot, () => 'NEUTRAL' as const);
  const state = __DEV__ && reviewKit && reviewState ? reviewState : current;
  const sequence = getDisplayedNimboSequence(state, reviewKit, __DEV__, reviewBlink);
  const sequenceKey = sequence.id ?? getNimboAssetKey(state);
  const blinking = sequence.id === 'blink';
  const allowed = canUseSequence(sequence, reviewKit, __DEV__);
  const { ref, active, reduced: systemReduced } = useNimboActivity();
  const reduced = systemReduced || (__DEV__ && reviewKit && reviewReduced);

  const [frame, setFrame] = useState({ state, sequenceKey, index: 0 });
  const [interacting, setInteracting] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const lastTapRef = useRef<number>(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInteracting = useRef(false);
  const isMounted = useRef(true);

  const ready = sequence.frames.every((_, i) => loaded.includes(`${sequenceKey}:${i}`));
  const playing = shouldPlay(active, reduced, interacting, allowed && ready);

  // One clock per visible sequence. Open-eye hold uses no polling or rerenders.
  useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (stopped) return;
      const clock = sequenceClock(Date.now() - start, sequence);
      setFrame(previous => previous.state === state && previous.sequenceKey === sequenceKey && previous.index === clock.index
        ? previous : { state, sequenceKey, index: clock.index });
      timer = setTimeout(tick, clock.nextInMs);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }, [playing, state, sequence, sequenceKey]);

  // Sync isInteracting ref with interacting state
  useEffect(() => {
    isInteracting.current = interacting;
  }, [interacting]);

  // Lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(scale);
      cancelAnimation(rotate);
    };
  }, []);

  const scheduleNextIdle = useCallback((currentState: NimboState) => {
    if (!isMounted.current || allowed) return; // Disable behavior engine if sequence allowed
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isInteracting.current || reduced) return;

    const { delay } = NimboBehavior.getIdleTiming(currentState);

    idleTimerRef.current = setTimeout(() => {
      if (!isInteracting.current && isMounted.current) {
        performIdleBehavior(currentState);
      }
    }, delay + Math.random() * 1000);
  }, [reduced, allowed]);

  useEffect(() => {
    if (!reduced && !isInteracting.current && isMounted.current && !allowed) {
      scheduleNextIdle(state);
    } else if (allowed || reduced) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      // Frame poses already move: cancel inherited spatial motion immediately.
      [translateY, translateX, scale, rotate].forEach(cancelAnimation);
      translateY.value = 0;
      translateX.value = 0;
      scale.value = 1;
      rotate.value = 0;
    }
  }, [state, reduced, allowed, scheduleNextIdle]);

  const onAnimationComplete = (finished?: boolean, currentState?: NimboState) => {
    if (finished && isMounted.current && currentState) {
      scheduleNextIdle(currentState);
    }
  };

  const performIdleBehavior = (currentState: NimboState) => {
    if (allowed) return;
    const action = NimboBehavior.getNextIdleEvent(currentState);
    const { duration } = NimboBehavior.getIdleTiming(currentState);

    switch (action) {
      case 'breathe':
        scale.value = withSequence(
          withTiming(1.05, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) }, (finished) => {
            runOnJS(onAnimationComplete)(finished, currentState);
          })
        );
        break;
      case 'float':
        translateY.value = withSequence(
          withTiming(-10, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration, easing: Easing.inOut(Easing.ease) }, (finished) => {
             runOnJS(onAnimationComplete)(finished, currentState);
          })
        );
        break;
      case 'hop':
        translateY.value = withSequence(
          withTiming(-20, { duration: duration * 0.3, easing: Easing.out(Easing.ease) }),
          withSpring(0, { damping: 12, stiffness: 90 }, (finished) => {
             runOnJS(onAnimationComplete)(finished, currentState);
          })
        );
        break;
      case 'tilt':
        rotate.value = withSequence(
          withTiming(10, { duration: duration * 0.5 }),
          withTiming(-10, { duration: duration }),
          withTiming(0, { duration: duration * 0.5 }, (finished) => {
             runOnJS(onAnimationComplete)(finished, currentState);
          })
        );
        break;
      case 'settle':
        translateY.value = withTiming(0, { duration });
        translateX.value = withTiming(0, { duration });
        scale.value = withTiming(1, { duration });
        rotate.value = withTiming(0, { duration }, (finished) => {
           runOnJS(onAnimationComplete)(finished, currentState);
        });
        break;
      case 'none':
      default:
        scheduleNextIdle(currentState);
        break;
    }
  };

  // State Transition (Emotional Transitions)
  useEffect(() => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    const reset = setTimeout(() => setInteracting(false), 0);

    if (allowed) {
      // Just standard opacity transition if using sequences
      cancelAnimation(opacity);
      opacity.value = active && !reduced ? withSequence(withTiming(0.7, { duration: 80 }), withTiming(1, { duration: 180 })) : 1;
      return () => {
        clearTimeout(reset);
        cancelAnimation(opacity);
        if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      };
    }

    setInteracting(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    cancelAnimation(opacity);
    opacity.value = withSequence(
      withTiming(0.5, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    scale.value = withSequence(
      withTiming(0.9, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    if (state === 'SLEEPING' || state === 'TIRED' || state === 'SLEEPY') {
      translateY.value = withTiming(15, { duration: 600 });
      rotate.value = withTiming(0, { duration: 400 });
    } else if (state === 'HAPPY' || state === 'ENERGETIC' || state === 'WAKING') {
      translateY.value = withSpring(-15, { damping: 12 }, (finished) => {
        if (finished && isMounted.current) translateY.value = withSpring(0);
      });
    } else {
      translateY.value = withTiming(0, { duration: 500 });
      rotate.value = withTiming(0, { duration: 500 });
    }

    transitionTimerRef.current = setTimeout(() => {
      if (isMounted.current) {
        setInteracting(false);
        scheduleNextIdle(state);
      }
    }, 800);

    return () => clearTimeout(reset);
  }, [state, active, reduced, allowed]);

  const tap = () => {
    if (!active || reduced || Date.now() - lastTapRef.current < 1000) return;
    lastTapRef.current = Date.now();
    setInteracting(true);

    if (allowed) {
      cancelAnimation(opacity);
      opacity.value = withSequence(withTiming(0.75, { duration: 100 }), withTiming(1, { duration: 180 }));
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => setInteracting(false), 280);
      return;
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (state === 'SLEEPING' || state === 'SLEEPY') {
      rotate.value = withSequence(withTiming(5, { duration: 400 }), withTiming(0, { duration: 400 }));
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) { setInteracting(false); scheduleNextIdle(state); }
      }, 800);
    } else if (state === 'ENERGETIC' || state === 'HAPPY') {
      translateY.value = withSequence(withTiming(-30, { duration: 200 }), withSpring(0, { damping: 10, stiffness: 100 }));
      scale.value = withSequence(withTiming(1.1, { duration: 200 }), withSpring(1));
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) { setInteracting(false); scheduleNextIdle(state); }
      }, 600);
    } else {
      translateY.value = withSequence(withTiming(-15, { duration: 250 }), withSpring(0));
      rotate.value = withSequence(withTiming(15, { duration: 200 }), withSpring(0));
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) { setInteracting(false); scheduleNextIdle(state); }
      }, 600);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }
      ],
    };
  });

  const index = playing && frame.state === state && frame.sequenceKey === sequenceKey ? frame.index : 0;
  const source = allowed ? sequence.frames[index] : NIMBO_ASSETS[getNimboAssetKey(state)];

  return (
    <View ref={ref} collapsable={false} testID="nimbo-stage" style={[styles.stage, blinking && allowed && styles.blinkStage]}>
      <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel="Pet Nimbo" style={[styles.touchArea, blinking && allowed && styles.blinkTouchArea]}>
        <Animated.View accessible={allowed} accessibilityRole={allowed?'image':undefined} accessibilityLabel={allowed?'Nimbo, '+state.toLowerCase().replaceAll('_',' '):undefined} style={[styles.imageMask, blinking && styles.blinkMask, animatedStyle]}>
          {allowed ? (
            sequence.frames.map((asset, i) => (
              <Image
                key={`${sequenceKey}:${i}`}
                testID={`nimbo-frame-${i}`}
                source={asset}
                style={[styles.nimboImage, blinking && styles.blinkImage, styles.frame, { opacity: index === i ? 1 : 0 }]}
                resizeMode="contain"
                accessible={false}
                aria-hidden={true}
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
                accessibilityLabel={'Nimbo, ' + state.toLowerCase().replaceAll('_', ' ')}
                onLoad={() => {
                  const key = `${sequenceKey}:${i}`;
                  setLoaded(previous => previous.includes(key) ? previous : [...previous, key]);
                }}
              />
            ))
          ) : (
            <Image
              source={source}
              style={styles.nimboImage}
              resizeMode="contain"
              accessibilityLabel={'Nimbo, ' + state.toLowerCase().replaceAll('_', ' ')}
            />
          )}
        </Animated.View>
      </Pressable>
      <Text style={styles.stateText}>{state}</Text>
      {__DEV__ && reviewKit && <Text testID="nimbo-playback">{blinking ? 'Blink · ' : ''}{playing ? 'Playing' : 'Paused'} · frame {index + 1}{reduced ? ' · reduced motion' : ''}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  touchArea: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  nimboImage: {
    width: 200,
    height: 180,
  },
  imageMask: {
    width: 200,
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  blinkStage: { height: 250 },
  blinkTouchArea: { padding: 0 },
  blinkMask: { width: 240, height: 197 },
  blinkImage: { width: 240, height: 197 },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});
