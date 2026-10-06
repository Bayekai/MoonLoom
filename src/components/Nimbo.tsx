import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { nimboController, NimboState, NIMBO_STATES } from '../services/nimboStateController';
import { NimboBehavior } from './NimboBehavior';
import { Cloud, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Star, Sun } from 'lucide-react-native';

export function Nimbo() {
  const [state, setState] = useState<NimboState>(nimboController.getState());
  const [reduceMotion, setReduceMotion] = useState(false);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const lastTapRef = useRef<number>(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInteracting = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    const unsubscribeState = nimboController.subscribe((newState) => {
      if (isMounted.current) {
        handleStateTransition(newState);
        setState(newState);
      }
    });

    return () => {
      isMounted.current = false;
      sub.remove();
      unsubscribeState();
      clearIdleTimer();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  };

  const scheduleNextIdle = useCallback((currentState: NimboState) => {
    if (!isMounted.current) return;
    clearIdleTimer();
    if (isInteracting.current || reduceMotion) return;

    const { delay } = NimboBehavior.getIdleTiming(currentState);

    idleTimerRef.current = setTimeout(() => {
      if (!isInteracting.current && isMounted.current) {
        performIdleBehavior(currentState);
      }
    }, delay + Math.random() * 1000); // Add jitter
  }, [reduceMotion]);

  useEffect(() => {
    if (!reduceMotion && !isInteracting.current && isMounted.current) {
      scheduleNextIdle(state);
    }
  }, [state, reduceMotion, scheduleNextIdle]);

  const onAnimationComplete = (finished?: boolean, currentState?: NimboState) => {
    if (finished && isMounted.current && currentState) {
      scheduleNextIdle(currentState);
    }
  };

  const performIdleBehavior = (currentState: NimboState) => {
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

  const handleStateTransition = (newState: NimboState) => {
    isInteracting.current = true;
    clearIdleTimer();
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    // Emotional Transitions (400-700ms)
    scale.value = withSequence(
      withTiming(0.9, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    if (newState === 'SLEEPING' || newState === 'TIRED' || newState === 'SLEEPY') {
      // Settle down
      translateY.value = withTiming(15, { duration: 600 });
      rotate.value = withTiming(0, { duration: 400 });
    } else if (newState === 'HAPPY' || newState === 'ENERGETIC' || newState === 'WAKING') {
      // Lift up
      translateY.value = withSpring(-15, { damping: 12 }, (finished) => {
        if (finished && isMounted.current) {
          translateY.value = withSpring(0);
        }
      });
    } else {
      // Return to neutral center
      translateY.value = withTiming(0, { duration: 500 });
      rotate.value = withTiming(0, { duration: 500 });
    }

    transitionTimerRef.current = setTimeout(() => {
      if (isMounted.current) {
        isInteracting.current = false;
        scheduleNextIdle(newState);
      }
    }, 800);
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 1000) return; // 1-second cooldown
    lastTapRef.current = now;

    isInteracting.current = true;
    clearIdleTimer();
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (reduceMotion) {
      scale.value = withSequence(withTiming(0.9, {duration: 150}), withTiming(1, {duration: 150}));
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) {
          isInteracting.current = false;
        }
      }, 300);
      return;
    }

    if (state === 'SLEEPING' || state === 'SLEEPY') {
      // Very subtle sleepy movement
      rotate.value = withSequence(
        withTiming(5, { duration: 400 }),
        withTiming(0, { duration: 400 })
      );
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) {
          isInteracting.current = false;
          scheduleNextIdle(state);
        }
      }, 800);
    } else if (state === 'ENERGETIC' || state === 'HAPPY') {
      // Excited bounce
      translateY.value = withSequence(
        withTiming(-30, { duration: 200 }),
        withSpring(0, { damping: 10, stiffness: 100 })
      );
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1)
      );
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) {
          isInteracting.current = false;
          scheduleNextIdle(state);
        }
      }, 600);
    } else {
      // Curious tilt/bounce
      translateY.value = withSequence(
        withTiming(-15, { duration: 250 }),
        withSpring(0)
      );
      rotate.value = withSequence(
        withTiming(15, { duration: 200 }),
        withSpring(0)
      );
      tapTimerRef.current = setTimeout(() => {
        if (isMounted.current) {
          isInteracting.current = false;
          scheduleNextIdle(state);
        }
      }, 600);
    }
  };

  const renderAsset = () => {
    switch (state) {
      case 'SLEEPING': return <CloudMoon size={100} color="#8b5cf6" />;
      case 'HAPPY': return <CloudSun size={100} color="#f59e0b" />;
      case 'ENERGETIC': return <CloudLightning size={100} color="#fbbf24" />;
      case 'TIRED':
      case 'SLEEPY': return <CloudFog size={100} color="#9ca3af" />;
      case 'STRESSED': return <CloudRain size={100} color="#6b7280" />;
      case 'WAKING': return <Sun size={100} color="#fcd34d" />;
      case 'CELEBRATING': return <Star size={100} color="#fbbf24" />;
      case 'BREAK_TIME': return <CloudSnow size={100} color="#93c5fd" />;
      case 'EATING': return <Moon size={100} color="#c4b5fd" />;
      case 'CALM': return <Cloud size={100} color="#a78bfa" />;
      // Handle the requested IMPROVING state from the problem definition explicitly
      case 'IMPROVING' as any: return <CloudSun size={100} color="#34d399" />;
      default: return <Cloud size={100} color="#e5e7eb" />; // Neutral
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }
      ],
    };
  });

  return (
    <View style={styles.stage}>
      <Pressable onPress={handleTap} style={styles.touchArea}>
        <Animated.View style={[styles.nimboContainer, animatedStyle]}>
          {renderAsset()}
          <Text style={styles.stateText}>{state}</Text>
        </Animated.View>
      </Pressable>
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
  nimboContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  }
});