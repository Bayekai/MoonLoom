import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { nimboController, NimboState } from '../services/nimboStateController';
import { getNimboAssetKey } from './nimboAssets';
import { canUseSequence, getDisplayedNimboSequence, sequenceClock, shouldPlay } from './nimboSequences';
import { useNimboActivity } from '../hooks/useNimboActivity';
import { useNimboMotion } from '../hooks/useNimboMotion';
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

export function Nimbo({ reviewKit = false, reviewState, reviewReduced = false, reviewBlink = false, reviewWalking = false }: {
  reviewKit?: boolean; reviewState?: NimboState; reviewReduced?: boolean; reviewBlink?: boolean; reviewWalking?: boolean;
}) {
  const current = useSyncExternalStore(subscribe, snapshot, () => 'NEUTRAL' as const);
  const state = __DEV__ && reviewKit && reviewState ? reviewState : current;
  const sequence = getDisplayedNimboSequence(state, reviewKit, __DEV__, reviewBlink);
  const sequenceKey = sequence.id ?? getNimboAssetKey(state);
  const blinking = sequence.id === 'blink';
  const allowed = canUseSequence(sequence, reviewKit, __DEV__);
  const { ref, active, reduced: systemReduced } = useNimboActivity();
  const reduced = systemReduced || (__DEV__ && reviewKit && reviewReduced);
  const [frame, setFrame] = useState({ state, sequenceKey, index: 0 });
  const [loaded, setLoaded] = useState<string[]>([]);
  const [happyLoaded, setHappyLoaded] = useState(false);
  const walkingPending = __DEV__ && reviewKit && reviewWalking;
  const motion = useNimboMotion(state, active, reduced, walkingPending || (allowed && !blinking && sequence.bakedMotion));
  const ready = sequence.frames.every((_, i) => loaded.includes(sequenceKey + ':' + i));
  // Physical/tap reactions do not pause or restart the existing eyelid clock.
  const playing = shouldPlay(active, reduced, false, allowed && ready);
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
    // Subscription timer keeps React effects free of synchronous state updates.
    timer = setTimeout(tick, 0);
    return () => { stopped = true; clearTimeout(timer); };
  }, [playing, state, sequence, sequenceKey]);
  const index = playing && frame.state === state && frame.sequenceKey === sequenceKey ? frame.index : 0;
  const respondingHappy = happyLoaded && motion.tapPhase === 'happy';
  const label = respondingHappy ? 'Nimbo, happy response' : 'Nimbo, ' + state.toLowerCase().replaceAll('_', ' ');
  return <View ref={ref} collapsable={false} testID="nimbo-stage" style={[styles.stage, blinking && allowed && styles.blinkStage, __DEV__ && reviewKit && styles.reviewStage]}>
    <Pressable onPress={() => { if (happyLoaded) motion.tap(); }} accessibilityRole="button" accessibilityLabel="Pet Nimbo" style={[styles.touchArea, blinking && allowed && styles.blinkTouchArea]}>
      <Animated.View testID="nimbo-motion" accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.imageMask, blinking && styles.blinkMask, motion.animatedStyle]}>
        {allowed ? sequence.frames.map((asset, i) => <Image
          key={sequenceKey + ':' + i} testID={'nimbo-frame-' + i} source={asset}
          style={[styles.nimboImage, blinking && styles.blinkImage, styles.frame, { opacity: index === i && !respondingHappy ? 1 : 0 }]}
          resizeMode="contain" accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          onLoad={() => { const key = sequenceKey + ':' + i; setLoaded(previous => previous.includes(key) ? previous : [...previous, key]); }}
        />) : <Image testID="nimbo-state-art" source={NIMBO_ASSETS[getNimboAssetKey(state)]} style={[styles.nimboImage, { opacity: respondingHappy ? 0 : 1 }]} resizeMode="contain" accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />}
        <Image testID="nimbo-tap-happy" source={NIMBO_ASSETS.HAPPY} style={[styles.nimboImage, styles.frame, { opacity: respondingHappy ? 1 : 0 }]} resizeMode="contain" accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLoad={() => setHappyLoaded(true)} />
      </Animated.View>
    </Pressable>
    <Text style={styles.stateText}>{state}</Text>
    {__DEV__ && reviewKit && <>
      <Text testID="nimbo-playback">{allowed ? `${blinking ? 'Blink · ' : ''}${playing ? 'Playing' : 'Paused'} · frame ${index + 1}` : 'Static state artwork · legacy loops disabled'}{reduced ? ' · reduced motion' : ''}</Text>
      <Text testID="nimbo-motion-status">{walkingPending ? 'Walking: awaiting approved artwork' : state === 'EATING' ? 'Static eating pose · chewing awaits artwork' : motion.moving ? 'Whole-character motion active' : 'Motion paused'} · tap {motion.tapPhase}</Text>
    </>}
  </View>;
}
const styles = StyleSheet.create({
  stage: {
    height: 240,
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
  reviewStage: { height: 310 },
  blinkTouchArea: { padding: 0 },
  blinkMask: { width: 240, height: 197 },
  blinkImage: { width: 240, height: 197 },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});
