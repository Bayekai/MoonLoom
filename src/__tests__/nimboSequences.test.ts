import fs from 'fs';
import path from 'path';
import { NIMBO_STATES } from '../services/nimboStateController';
// Metro assets are mocked as paths so these tests validate mapping and playback policy.
const root=path.resolve(__dirname,'../../assets/nimbo/animations');
for(const directory of fs.readdirSync(root))for(const file of fs.readdirSync(path.join(root,directory))){
  const asset=path.join(root,directory,file);
  jest.doMock(asset,()=>asset);
}
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Load after registering PNG mocks.
const { NIMBO_SEQUENCES,NIMBO_BLINK_SEQUENCE,getNimboSequence,getDisplayedNimboSequence,canUseSequence,frameAt,sequenceClock,shouldPlay }=require('../components/nimboSequences') as typeof import('../components/nimboSequences');

describe('Nimbo kit safety and playback',()=>{
  test.each(Object.keys(NIMBO_STATES))('%s has a valid static Metro mapping',state=>{
    const sequence=getNimboSequence(state as keyof typeof NIMBO_STATES);
    expect([6,8]).toContain(sequence.frames.length);
    for(const frame of sequence.frames)expect(fs.existsSync(frame as string)).toBe(true);
    expect(canUseSequence(sequence,false,true)).toBe(false);
    expect(canUseSequence(sequence,true,false)).toBe(false);
    expect(canUseSequence(sequence,true,true)).toBe(true);
  });
  test('manifest counts match every sequence',()=>{
    const manifest=JSON.parse(fs.readFileSync(path.resolve(root,'../manifest.json'),'utf8'));
    expect(Object.values(NIMBO_SEQUENCES).reduce((sum,s)=>sum+s.frames.length,0)).toBe(Object.values(manifest.frameCounts).reduce((sum:number,n)=>sum+Number(n),0));
  });
  test('frame clock wraps and remains bounded after delayed ticks',()=>{
    expect(frameAt(0,8,8)).toBe(0);expect(frameAt(125,8,8)).toBe(1);
    expect(frameAt(1000,8,8)).toBe(0);expect(frameAt(1125,8,8)).toBe(1);
    expect(frameAt(-100,8,8)).toBe(0);expect(frameAt(100,8,0)).toBe(0);
  });
  test('hidden, reduced motion, interactive and unapproved playback is stopped',()=>{
    expect(shouldPlay(true,false,false,true)).toBe(true);
    expect(shouldPlay(false,false,false,true)).toBe(false);
    expect(shouldPlay(true,true,false,true)).toBe(false);
    expect(shouldPlay(true,false,true,true)).toBe(false);
    expect(shouldPlay(true,false,false,false)).toBe(false);
  });
  test('blink follows the imported manifest and stays unapproved',()=>{
    const manifest=JSON.parse(fs.readFileSync(path.resolve(root,'blink/manifest.json'),'utf8'));
    expect(NIMBO_BLINK_SEQUENCE.frames.map(frame=>path.basename(frame as string))).toEqual(manifest.frameOrder);
    expect(NIMBO_BLINK_SEQUENCE.approved).toBe(false);
    expect(manifest.approved).toBe(false);
    expect(canUseSequence(NIMBO_BLINK_SEQUENCE,false,true)).toBe(true);
    expect(canUseSequence(NIMBO_BLINK_SEQUENCE,false,false)).toBe(true);
    expect(NIMBO_BLINK_SEQUENCE.productionEnabled).toBe(manifest.productionEnabled);
  });
  test.each(['NEUTRAL','CALM','ENCOURAGING'] as const)('%s uses the explicitly enabled blink in development and production',state=>{
    expect(getDisplayedNimboSequence(state,false,true)).toBe(NIMBO_BLINK_SEQUENCE);
    expect(getDisplayedNimboSequence(state,false,false)).toBe(NIMBO_BLINK_SEQUENCE);
  });
  test.each(['SLEEPING','EATING','BREAK_TIME','TIRED','HAPPY','STRESSED'] as const)('%s retains its corresponding artwork',state=>{
    expect(getDisplayedNimboSequence(state,false,true)).toBe(getNimboSequence(state));
  });
  test('review can select blink independently without changing the state controller',()=>{
    expect(getDisplayedNimboSequence('NEUTRAL',true,true,true)).toBe(NIMBO_BLINK_SEQUENCE);
    expect(getDisplayedNimboSequence('NEUTRAL',true,true,false)).toBe(getNimboSequence('NEUTRAL'));
    expect(getDisplayedNimboSequence('NEUTRAL',true,false,true)).toBe(getNimboSequence('NEUTRAL'));
  });
  test('blink clock holds open, closes, reopens and wraps without a catch-up burst',()=>{
    expect(sequenceClock(0,NIMBO_BLINK_SEQUENCE)).toEqual({index:0,nextInMs:4800});
    expect(sequenceClock(4799,NIMBO_BLINK_SEQUENCE)).toEqual({index:0,nextInMs:1});
    expect(sequenceClock(4800,NIMBO_BLINK_SEQUENCE).index).toBe(1);
    expect(sequenceClock(4890,NIMBO_BLINK_SEQUENCE).index).toBe(2);
    expect(sequenceClock(5000,NIMBO_BLINK_SEQUENCE).index).toBe(3);
    expect(sequenceClock(5090,NIMBO_BLINK_SEQUENCE).index).toBe(4);
    expect(sequenceClock(5200,NIMBO_BLINK_SEQUENCE)).toEqual({index:0,nextInMs:4800});
    expect(sequenceClock(10400,NIMBO_BLINK_SEQUENCE).index).toBe(0);
  });
  test('legacy sequences retain their original FPS',()=>{
    expect(sequenceClock(125,NIMBO_SEQUENCES.NEUTRAL)).toEqual({index:1,nextInMs:125});
    expect(sequenceClock(250,NIMBO_SEQUENCES.SLEEPING)).toEqual({index:1,nextInMs:250});
  });
});
