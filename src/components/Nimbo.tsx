import React, { useSyncExternalStore } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { nimboController } from '../services/nimboStateController';
import { getNimboAssetKey } from './nimboAssets';

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


const subscribe=(notify:()=>void)=>nimboController.subscribe(()=>notify());
const snapshot=()=>nimboController.getState();

// Official GitHub artwork is static. State changes select an image only;
// there are no root transforms, idle loops, tap animations or haptics.
export function Nimbo() {
  const state=useSyncExternalStore(subscribe,snapshot,()=> 'NEUTRAL' as const);
  const source=NIMBO_ASSETS[getNimboAssetKey(state)];
  return <View style={styles.stage}><View style={styles.nimboContainer}>
    <View style={styles.imageMask}><Image source={source} style={styles.nimboImage} resizeMode="contain" accessibilityLabel={`Nimbo, ${state.toLowerCase().replaceAll('_',' ')}`}/></View>
    <Text style={styles.stateText}>{state}</Text>
  </View></View>;
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
  },
  nimboImage: {
    width: 200,
    height: 180,
    // Cropping bottom text out of the image by shifting it up if necessary
    // or just relying on overflow: 'hidden' in imageMask
  },
  imageMask: {
    width: 200,
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }
});
