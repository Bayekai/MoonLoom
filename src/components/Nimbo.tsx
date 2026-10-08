import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Pressable } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { nimboController, NimboState } from '../services/nimboStateController';
import { getNimboAssetKey } from './nimboAssets';
import { canUseSequence, frameAt, getNimboSequence, shouldPlay } from './nimboSequences';
import { useNimboActivity } from '../hooks/useNimboActivity';
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
// reviewState bypasses controller only in the isolated development review screen.
export function Nimbo({reviewKit=false,reviewState,reviewReduced=false}:{reviewKit?:boolean;reviewState?:NimboState;reviewReduced?:boolean}) {
  const current=useSyncExternalStore(subscribe,snapshot,()=> 'NEUTRAL' as const);
  const state=__DEV__ && reviewKit && reviewState ? reviewState : current;
  const sequence=getNimboSequence(state);
  const allowed=canUseSequence(sequence,reviewKit,__DEV__);
  const {ref,active,reduced:systemReduced}=useNimboActivity();
  const reduced=systemReduced || (__DEV__ && reviewKit && reviewReduced);
  const [frame,setFrame]=useState({state,index:0});
  const [interacting,setInteracting]=useState(false);
  const [loaded,setLoaded]=useState<string[]>([]);
  const opacity=useSharedValue(1);
  const interactionTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const lastTap=useRef(0);
  const ready=sequence.frames.every((_,i)=>loaded.includes(`${getNimboAssetKey(state)}:${i}`));
  const playing=shouldPlay(active,reduced,interacting,allowed && ready);
  useEffect(()=>{
    if(!playing)return;
    const start=Date.now();
    const timer=setInterval(()=>setFrame({state,index:frameAt(Date.now()-start,sequence.fps,sequence.frames.length)}),1000/sequence.fps);
    return ()=>clearInterval(timer);
  },[playing,state,sequence]);
  useEffect(()=>{
    if(interactionTimer.current)clearTimeout(interactionTimer.current);
    cancelAnimation(opacity);
    // Frames already translate the character. No Reanimated spatial transforms.
    opacity.value = active && !reduced ? withSequence(withTiming(0.7,{duration:80}),withTiming(1,{duration:180})) : 1;
    return ()=>{cancelAnimation(opacity);if(interactionTimer.current)clearTimeout(interactionTimer.current);};
  },[state,active,reduced,opacity]);
  // A state change or hidden screen cancels an in-flight tap and releases playback.
  useEffect(()=>{const reset=setTimeout(()=>setInteracting(false),0);return ()=>clearTimeout(reset);},[state,active,reduced]);
  const style=useAnimatedStyle(()=>({opacity:opacity.value}));
  const tap=()=>{
    if(!active || reduced || Date.now()-lastTap.current<1000)return;
    lastTap.current=Date.now();setInteracting(true);
    cancelAnimation(opacity);
    opacity.value = withSequence(withTiming(0.75,{duration:100}),withTiming(1,{duration:180}));
    interactionTimer.current=setTimeout(()=>setInteracting(false),280);
  };
  const index=playing && frame.state===state ? frame.index : 0;
  const source=allowed ? sequence.frames[index] : NIMBO_ASSETS[getNimboAssetKey(state)];
  return <View ref={ref} collapsable={false} style={styles.stage}>
    <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel="Pet Nimbo" style={styles.touchArea}>
      <Animated.View style={[styles.image,style]}>
        {allowed ? sequence.frames.map((asset,i)=><Image key={`${getNimboAssetKey(state)}:${i}`} source={asset} style={[styles.image,styles.frame,{opacity:index===i?1:0}]} resizeMode="contain" accessible={index===i} accessibilityElementsHidden={index!==i} importantForAccessibility={index===i?'auto':'no-hide-descendants'} accessibilityLabel={'Nimbo, '+state.toLowerCase().replaceAll('_',' ')} onLoad={()=>{const key=`${getNimboAssetKey(state)}:${i}`;setLoaded(previous=>previous.includes(key)?previous:[...previous,key]);}}/>) : <Image source={source} style={styles.image} resizeMode="contain" accessibilityLabel={'Nimbo, '+state.toLowerCase().replaceAll('_',' ')}/>}
      </Animated.View>
    </Pressable>
    <Text style={styles.stateText}>{state}</Text>
    {__DEV__ && reviewKit && <Text testID="nimbo-playback">{playing?'Playing':'Paused'} · frame {index+1}{reduced?' · reduced motion':''}</Text>}
  </View>;
}
const styles=StyleSheet.create({stage:{height:200,width:'100%',alignItems:'center',justifyContent:'center'},touchArea:{alignItems:'center'},image:{width:240,height:150},frame:{position:'absolute',top:0,left:0},stateText:{marginTop:10,fontSize:16,fontWeight:'bold',color:'#374151'}});
