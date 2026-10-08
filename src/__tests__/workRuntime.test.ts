import { useStore } from '../store/useStore';
import { defaultWork } from '../services/workCore';
import { performWorkAction, tickWork } from '../services/workRuntime';
import { workNotificationPlan } from '../services/workNotificationPlan';
import { nimboController } from '../services/nimboStateController';
const at=(h:number,m=0)=>new Date(2026,9,4,h,m);
beforeEach(()=>{const work=defaultWork();Object.assign(work.schedule,{enabled:true,desktop:true,days:[0,1,2,3,4,5,6]});useStore.setState({work,isSleeping:false});});
test('starting and finishing a timed break preserves food, profile and sleep history',()=>{
  useStore.getState().updateProfile({foodBalance:7});const profile={...useStore.getState().profile};const sleep=useStore.getState().sleepSessions;
  const [notice]=tickWork(at(13));performWorkAction('take',{minutes:5,slotId:notice.id},at(13));expect(nimboController.getState()).toBe('BREAK_TIME');
  expect(tickWork(at(13,5))[0].kind).toBe('completion');expect(useStore.getState().profile).toEqual(profile);expect(useStore.getState().sleepSessions).toBe(sleep);
});
test('persisted sleep status suppresses work reminders',()=>{useStore.getState().setSleeping(true);expect(tickWork(at(13))).toEqual([]);expect(useStore.getState().work.runtime.shifts['2026-10-04'].slots).toBeDefined();});
test('native plan contains future dates only and is bounded',()=>{const work=useStore.getState().work;work.schedule.mode='custom';work.schedule.interval=30;const plan=workNotificationPlan(work,false,at(9));expect(plan).toHaveLength(48);expect(plan.every(n=>Date.parse(n.at)>+at(9))).toBe(true);expect(new Set(plan.map(n=>n.id)).size).toBe(plan.length);});
test('native plan respects pause, disable, sleeping, notifications off and shift skip',()=>{
  const work=useStore.getState().work;expect(workNotificationPlan(work,true,at(9))).toEqual([]);work.runtime.paused=true;expect(workNotificationPlan(work,false,at(9))).toEqual([]);work.runtime.paused=false;work.schedule.desktop=false;expect(workNotificationPlan(work,false,at(9))).toEqual([]);work.schedule.desktop=true;work.schedule.enabled=false;expect(workNotificationPlan(work,false,at(9))).toEqual([]);
});
test('snooze moves the native slot date and skips the entire current shift',()=>{const [notice]=tickWork(at(13));performWorkAction('snooze',{slotId:notice.id},at(13));let plan=workNotificationPlan(useStore.getState().work,false,at(13));expect(plan.find(n=>n.id===notice.id)?.at).toBe(at(13,15).toISOString());performWorkAction('skip',{},at(13,1));plan=workNotificationPlan(useStore.getState().work,false,at(13,1));expect(plan.some(n=>n.shift?.id==='2026-10-04')).toBe(false);});
test('native completion is scheduled at saved timer end and cleared by cancellation',()=>{const [notice]=tickWork(at(13));performWorkAction('take',{slotId:notice.id,minutes:10},at(13));expect(workNotificationPlan(useStore.getState().work,false,at(13)).find(n=>n.kind==='completion')?.at).toBe(at(13,10).toISOString());performWorkAction('cancel',{},at(13,1));expect(workNotificationPlan(useStore.getState().work,false,at(13,1)).some(n=>n.kind==='completion')).toBe(false);});
