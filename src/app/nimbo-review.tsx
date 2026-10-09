import { useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView, Text, Pressable, View, StyleSheet, Switch } from 'react-native';
import { Nimbo } from '../components/Nimbo';
import type { NimboState } from '../services/nimboStateController';
import { NIMBO_ANIMATION_DEFINITIONS, NimboAnimationId } from '../components/nimboAnimationDefinitions';

const STATES:Record<NimboAnimationId,NimboState>={idle:'NEUTRAL',happy:'HAPPY',eating:'EATING',sleeping:'SLEEPING',wake:'WAKING',walking:'PLAYING',tap:'NEUTRAL'};
const LABELS:Record<NimboAnimationId,string>={idle:'IDLE / BLINK',happy:'HAPPY',eating:'EATING',sleeping:'SLEEPING',wake:'WAKE / STRETCH',walking:'WALKING',tap:'TAP REACTION'};

export default function NimboReview() {
  const [mode,setMode]=useState<NimboAnimationId>('idle');
  const [reduced,setReduced]=useState(false);
  const [replay,setReplay]=useState(0);
  if(!__DEV__)return <Text>Animation review is available in development only.</Text>;
  const definition=NIMBO_ANIMATION_DEFINITIONS[mode];
  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.title}>Nimbo animation review</Text>
    <Text>Existing artwork and blink are preserved. Rejected legacy sequences are disabled. The reference sheet is a pose guide only.</Text>
    <Link href="/nimbo-rive-review">Preview unapproved Rive idle prototype</Link>
    <Nimbo key={`${mode}:${replay}`} reviewKit reviewState={STATES[mode]} reviewReduced={reduced} reviewBlink={mode==='idle'||mode==='tap'} reviewWalking={mode==='walking'}/>
    <View><Text>Preview reduced motion</Text><Switch accessibilityLabel="Preview reduced motion" value={reduced} onValueChange={setReduced}/></View>
    <View style={styles.buttons}>{(Object.keys(STATES) as NimboAnimationId[]).map(id=><Pressable key={id} accessibilityRole="button" onPress={()=>setMode(id)} style={[styles.button,mode===id&&styles.selected]}><Text>{LABELS[id]}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={()=>setReplay(n=>n+1)} style={styles.button}><Text>Replay behavior</Text></Pressable></View>
    <Text testID="nimbo-behavior-description">{definition.visualNow}</Text>
    {mode==='tap' && <Text>Tap Nimbo above. A true surprised expression still needs new artwork.</Text>}
    <Text style={styles.label}>Awaiting approved artwork · {definition.artwork.expectedFrames} intended frames</Text>
    {definition.artwork.requiredDetails.map(detail=><Text key={detail}>• {detail}</Text>)}
    <Text>Whole-character motion: {definition.wholeCharacterMovement?'yes':'no'}. No independent missing body parts are simulated.</Text>
    <Text>Scroll Nimbo out of view to pause motion and blinking. This review leaves the state controller, food and sleep data unchanged.</Text>
    <View style={{height:700}}/>
    <Text>Nimbo is offscreen; animation is paused.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{padding:24,gap:14,backgroundColor:'#efe8dc'},title:{fontSize:24,fontWeight:'bold'},label:{fontWeight:'bold'},buttons:{flexDirection:'row',flexWrap:'wrap',gap:8},button:{padding:10,backgroundColor:'#ddd1f0',borderRadius:8},selected:{backgroundColor:'#bfa3ea'}});
