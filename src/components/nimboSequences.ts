import type { ImageSourcePropType } from 'react-native';
import type { NimboState } from '../services/nimboStateController';
import { getNimboAssetKey, NimboAssetKey } from './nimboAssets';
export interface NimboSequence { id?: string; frames: ImageSourcePropType[]; fps: number; approved: boolean; bakedMotion: boolean; developmentEnabled?: boolean; productionEnabled?: boolean; durationsMs?: number[]; }
export const NIMBO_BLINK_SEQUENCE: NimboSequence = {
  // User explicitly enabled production use despite the documented visual defects.
  id: 'blink', approved: false, productionEnabled: true, developmentEnabled: true, bakedMotion: true, fps: 10,
  // Hold the open eyes between blinks; play the five original poses once in order.
  durationsMs: [4800, 90, 110, 90, 110],
  frames: [
    require('../../assets/nimbo/animations/blink/blink-01.png'),
    require('../../assets/nimbo/animations/blink/blink-02.png'),
    require('../../assets/nimbo/animations/blink/blink-03.png'),
    require('../../assets/nimbo/animations/blink/blink-04.png'),
    require('../../assets/nimbo/animations/blink/blink-05.png'),
  ],
};
// All supplied masks failed visual QA. Only the explicit development review may use them.
export const NIMBO_SEQUENCES: Record<NimboAssetKey,NimboSequence> = {
  NEUTRAL: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/idle/idle_01.png'),
    require('../../assets/nimbo/animations/idle/idle_02.png'),
    require('../../assets/nimbo/animations/idle/idle_03.png'),
    require('../../assets/nimbo/animations/idle/idle_04.png'),
    require('../../assets/nimbo/animations/idle/idle_05.png'),
    require('../../assets/nimbo/animations/idle/idle_06.png'),
  ] },
  HAPPY: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/happy/happy_01.png'),
    require('../../assets/nimbo/animations/happy/happy_02.png'),
    require('../../assets/nimbo/animations/happy/happy_03.png'),
    require('../../assets/nimbo/animations/happy/happy_04.png'),
    require('../../assets/nimbo/animations/happy/happy_05.png'),
    require('../../assets/nimbo/animations/happy/happy_06.png'),
    require('../../assets/nimbo/animations/happy/happy_07.png'),
    require('../../assets/nimbo/animations/happy/happy_08.png'),
  ] },
  ENERGETIC: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/energetic/energetic_01.png'),
    require('../../assets/nimbo/animations/energetic/energetic_02.png'),
    require('../../assets/nimbo/animations/energetic/energetic_03.png'),
    require('../../assets/nimbo/animations/energetic/energetic_04.png'),
    require('../../assets/nimbo/animations/energetic/energetic_05.png'),
    require('../../assets/nimbo/animations/energetic/energetic_06.png'),
    require('../../assets/nimbo/animations/energetic/energetic_07.png'),
    require('../../assets/nimbo/animations/energetic/energetic_08.png'),
  ] },
  TIRED: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/tired/tired_01.png'),
    require('../../assets/nimbo/animations/tired/tired_02.png'),
    require('../../assets/nimbo/animations/tired/tired_03.png'),
    require('../../assets/nimbo/animations/tired/tired_04.png'),
    require('../../assets/nimbo/animations/tired/tired_05.png'),
    require('../../assets/nimbo/animations/tired/tired_06.png'),
  ] },
  SLEEPING: { approved: false, bakedMotion: true, fps: 4, frames: [
    require('../../assets/nimbo/animations/sleep/sleep_01.png'),
    require('../../assets/nimbo/animations/sleep/sleep_02.png'),
    require('../../assets/nimbo/animations/sleep/sleep_03.png'),
    require('../../assets/nimbo/animations/sleep/sleep_04.png'),
    require('../../assets/nimbo/animations/sleep/sleep_05.png'),
    require('../../assets/nimbo/animations/sleep/sleep_06.png'),
    require('../../assets/nimbo/animations/sleep/sleep_07.png'),
    require('../../assets/nimbo/animations/sleep/sleep_08.png'),
  ] },
  STRESSED: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/stressed/stressed_01.png'),
    require('../../assets/nimbo/animations/stressed/stressed_02.png'),
    require('../../assets/nimbo/animations/stressed/stressed_03.png'),
    require('../../assets/nimbo/animations/stressed/stressed_04.png'),
    require('../../assets/nimbo/animations/stressed/stressed_05.png'),
    require('../../assets/nimbo/animations/stressed/stressed_06.png'),
  ] },
  EATING: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/eat/eat_01.png'),
    require('../../assets/nimbo/animations/eat/eat_02.png'),
    require('../../assets/nimbo/animations/eat/eat_03.png'),
    require('../../assets/nimbo/animations/eat/eat_04.png'),
    require('../../assets/nimbo/animations/eat/eat_05.png'),
    require('../../assets/nimbo/animations/eat/eat_06.png'),
    require('../../assets/nimbo/animations/eat/eat_07.png'),
    require('../../assets/nimbo/animations/eat/eat_08.png'),
  ] },
  BREAK_TIME: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/break-time/break-time_01.png'),
    require('../../assets/nimbo/animations/break-time/break-time_02.png'),
    require('../../assets/nimbo/animations/break-time/break-time_03.png'),
    require('../../assets/nimbo/animations/break-time/break-time_04.png'),
    require('../../assets/nimbo/animations/break-time/break-time_05.png'),
    require('../../assets/nimbo/animations/break-time/break-time_06.png'),
    require('../../assets/nimbo/animations/break-time/break-time_07.png'),
    require('../../assets/nimbo/animations/break-time/break-time_08.png'),
  ] },
  IMPROVING: { approved: false, bakedMotion: true, fps: 8, frames: [
    require('../../assets/nimbo/animations/improving/improving_01.png'),
    require('../../assets/nimbo/animations/improving/improving_02.png'),
    require('../../assets/nimbo/animations/improving/improving_03.png'),
    require('../../assets/nimbo/animations/improving/improving_04.png'),
    require('../../assets/nimbo/animations/improving/improving_05.png'),
    require('../../assets/nimbo/animations/improving/improving_06.png'),
    require('../../assets/nimbo/animations/improving/improving_07.png'),
    require('../../assets/nimbo/animations/improving/improving_08.png'),
  ] },
};
export const getNimboSequence=(state:NimboState)=>NIMBO_SEQUENCES[getNimboAssetKey(state)];
export function canUseSequence(sequence:NimboSequence,review:boolean,development:boolean){return sequence.approved || sequence.productionEnabled===true || (development && (review || sequence.developmentEnabled===true));}
export function getDisplayedNimboSequence(state:NimboState,review:boolean,development:boolean,reviewBlink=false):NimboSequence {
  if(development && review && reviewBlink)return NIMBO_BLINK_SEQUENCE;
  if(!review && ['NEUTRAL','CALM','ENCOURAGING'].includes(state) && canUseSequence(NIMBO_BLINK_SEQUENCE,false,development))return NIMBO_BLINK_SEQUENCE;
  return getNimboSequence(state);
}
export function sequenceClock(elapsed:number,sequence:NimboSequence):{index:number;nextInMs:number} {
  const durations=sequence.durationsMs ?? sequence.frames.map(()=>1000/sequence.fps);
  const total=durations.reduce((sum,duration)=>sum+duration,0);
  if(total<=0 || durations.length!==sequence.frames.length)return {index:0,nextInMs:1000};
  let phase=Math.max(0,elapsed)%total;
  for(let index=0;index<durations.length;index++){
    if(phase<durations[index])return {index,nextInMs:Math.max(1,durations[index]-phase)};
    phase-=durations[index];
  }
  return {index:0,nextInMs:durations[0]};
}
export function frameAt(elapsed:number,fps:number,count:number){return count>0?Math.floor(Math.max(0,elapsed)*fps/1000)%count:0;}
export function shouldPlay(active:boolean,reduced:boolean,interacting:boolean,allowed:boolean){return active && !reduced && !interacting && allowed;}
