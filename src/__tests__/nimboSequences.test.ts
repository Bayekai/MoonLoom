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
const { NIMBO_SEQUENCES,getNimboSequence,canUseSequence,frameAt,shouldPlay }=require('../components/nimboSequences') as typeof import('../components/nimboSequences');

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
});
