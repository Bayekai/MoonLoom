import { useState } from 'react';
import { ScrollView, Text, Pressable, View, StyleSheet, Switch } from 'react-native';
import { Nimbo } from '../components/Nimbo';
import { NimboAssetKey } from '../components/nimboAssets';
import { NIMBO_SEQUENCES } from '../components/nimboSequences';

export default function NimboReview() {
  const [state,setState]=useState<NimboAssetKey>('NEUTRAL');
  const [reduced,setReduced]=useState(false);
  if(!__DEV__)return <Text>Asset review is available in development only.</Text>;
  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.title}>Nimbo asset review</Text>
    <Text>Unapproved artwork. These loops translate the entire character; they do not animate facial features or paws. Production keeps the original assets.</Text>
    <Nimbo reviewKit reviewState={state} reviewReduced={reduced}/>
    <View><Text>Preview reduced motion</Text><Switch accessibilityLabel="Preview reduced motion" value={reduced} onValueChange={setReduced}/></View>
    <Text>{NIMBO_SEQUENCES[state].frames.length} frames · {NIMBO_SEQUENCES[state].fps} FPS · QA rejected</Text>
    <View style={styles.buttons}>{(Object.keys(NIMBO_SEQUENCES) as NimboAssetKey[]).map(key=><Pressable key={key} accessibilityRole="button" onPress={()=>setState(key)} style={styles.button}><Text>{key}</Text></Pressable>)}</View>
    <Text>Scroll Nimbo out of view to pause playback. Reduced motion shows a still frame. This review does not alter food, sleep data or the state controller.</Text>
    <View style={{height:700}}/>
    <Text>Nimbo is offscreen; playback is paused.</Text>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{padding:24,gap:16,backgroundColor:'#efe8dc'},title:{fontSize:24,fontWeight:'bold'},buttons:{flexDirection:'row',flexWrap:'wrap',gap:8},button:{padding:10,backgroundColor:'#ddd1f0',borderRadius:8}});
