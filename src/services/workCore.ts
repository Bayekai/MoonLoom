// Work scheduling is deterministic. All dates use the device's local timezone.
export type CoachStyle = 'Supportive'|'Calm'|'Motivational'|'Funny'|'Direct';
export type WorkSchedule = {enabled:boolean;start:string;end:string;days:number[];minutes:5|10;mode:'midpoint'|'120'|'180'|'custom'|'off';interval:number;desktop:boolean;overrides:Record<string,{start?:string;end?:string;off?:boolean}>};
export type WorkShift = {id:string;start:string;end:string;midpoint:string;minutes:number};
export type WorkSlot = {id:string;at:string};
export type SlotDecision = {status:'offered'|'snoozed'|'started'|'completed'|'missed';until?:string;offeredAt?:string};
export type ShiftDecision = {slots:Record<string,SlotDecision>;finished:boolean;skipped:boolean};
export type WorkState = {version:number;schedule:WorkSchedule;runtime:{paused:boolean;shifts:Record<string,ShiftDecision>;timer:null|{shiftId:string;slotId:string;start:string;end:string;minutes:number};completion:null|{id:string;shiftId:string;at:string;announced:boolean}}};
export type WorkNotice = {kind:'reminder'|'completion';id:string;shift?:WorkShift};
export type WorkAction = 'pause'|'resume'|'dismiss'|'cancel'|'finish'|'skip'|'snooze'|'take';
export const day=(value:Date|string=new Date())=>{const d=new Date(typeof value==='string'?value:+value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};

export const MODES = ['midpoint','120','180','custom','off'];
export const defaultWork = (): WorkState => ({version:1,schedule:{enabled:false,start:'09:00',end:'17:00',days:[],minutes:5,mode:'midpoint',interval:120,desktop:false,overrides:{}},runtime:{paused:false,shifts:{},timer:null,completion:null}});
export function migrateWork(state: {work?:WorkState}) {
  const defaults=defaultWork();
  if(!state.work) state.work=defaults;
  else { state.work={...defaults,...state.work,schedule:{...defaults.schedule,...state.work.schedule},runtime:{...defaults.runtime,...state.work.runtime}}; }
  return state.work!;
}
function clock(value:string) {
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')) throw Error('Use a valid start and end time.');
  return value.split(':').map(Number);
}
export function validateSchedule(input:WorkSchedule) {
  const start=clock(input.start),end=clock(input.end);
  if(start.join(':')===end.join(':')) throw Error('Start and end must differ; a 24-hour shift is not supported.');
  if(!Array.isArray(input.days)||input.days.some(d=>!Number.isInteger(d)||d<0||d>6)) throw Error('Choose valid working days.');
  if(input.enabled&&!input.days.length) throw Error('Select at least one working day.');
  if(![5,10].includes(input.minutes)) throw Error('Choose a five- or ten-minute break.');
  if(!MODES.includes(input.mode)) throw Error('Choose a reminder frequency.');
  if(!Number.isInteger(input.interval)||input.interval<30||input.interval>720) throw Error('Custom interval must be between 30 and 720 minutes.');
  return {...input,days:[...new Set(input.days)].sort(),overrides:input.overrides||{}};
}
// An adapter can later supply {start,end} or {off:true} by start-date.
export function shiftOn(schedule:WorkSchedule,anchor:Date): WorkShift|null {
  const base=new Date(+anchor);base.setHours(0,0,0,0);
  const override=schedule.overrides?.[day(base)];
  if(override?.off || (!override&&!schedule.days.includes(base.getDay())))return null;
  const [sh,sm]=clock(override?.start||schedule.start),[eh,em]=clock(override?.end||schedule.end);
  if(sh===eh&&sm===em)return null;
  const start=new Date(+base);start.setHours(sh,sm,0,0);
  const end=new Date(+base);if(eh*60+em<=sh*60+sm)end.setDate(end.getDate()+1);end.setHours(eh,em,0,0);
  if(+end<=+start)return null;
  return {id:day(base),start:start.toISOString(),end:end.toISOString(),midpoint:new Date((+start+ +end)/2).toISOString(),minutes:(+end- +start)/60000};
}
export function currentShift(schedule:WorkSchedule,now=new Date()): WorkShift|null {
  // Yesterday's start owns the early-morning part of an overnight shift.
  for(const offset of [-1,0]) {const anchor=new Date(+now);anchor.setDate(anchor.getDate()+offset);const shift=shiftOn(schedule,anchor);if(shift&&+now>=Date.parse(shift.start)&&+now<Date.parse(shift.end))return shift;}
  return null;
}
export function nextShift(schedule:WorkSchedule,now=new Date()): WorkShift|null {
  for(let i=0;i<=7;i++){const d=new Date(+now);d.setDate(d.getDate()+i);const shift=shiftOn(schedule,d);if(shift&&Date.parse(shift.start)>+now)return shift;}
  return null;
}
export function slotsFor(schedule:WorkSchedule,shift:WorkShift|null): WorkSlot[] {
  if(!shift||schedule.mode==='off')return [];
  const start=Date.parse(shift.start),end=Date.parse(shift.end);
  const interval=schedule.mode==='custom'?schedule.interval:Number(schedule.mode);
  const times=schedule.mode==='midpoint'?[Date.parse(shift.midpoint)]:Array.from({length:Math.max(0,Math.ceil((end-start)/(interval*60000))-1)},(_,i)=>start+(i+1)*interval*60000);
  return times.filter(at=>at>start&&at<end).map(at=>({id:`${shift.id}/${at}`,at:new Date(at).toISOString()}));
}
const shiftState=(work:WorkState,shift:WorkShift)=>work.runtime.shifts[shift.id]||=({slots:{},finished:false,skipped:false});
export function offeredBreak(work:WorkState,now=new Date(),sleeping=false) {
  const s=work.schedule,r=work.runtime;
  if(!s.enabled||s.mode==='off'||sleeping||r.paused||r.timer)return null;
  const shift=currentShift(s,now);if(!shift)return null;
  const status=r.shifts[shift.id];if(!status||status.finished||status.skipped)return null;
  const slot=slotsFor(s,shift).find(slot=>status.slots[slot.id]?.status==='offered');
  return slot?{...slot,shift}:null;
}
// A late wake/reopen does not produce a backlog. Only the latest slot within
// 30 minutes is eligible. Explicit snoozes remain eligible until shift end.
export function advanceWork(work:WorkState,now=new Date(),sleeping=false) {
  const r=work.runtime,notices:WorkNotice[]=[];let changed=false;
  if(r.timer&&+now>=Date.parse(r.timer.end)) {
    const timer=r.timer;const status=r.shifts[timer.shiftId];
    if(status?.slots[timer.slotId])status.slots[timer.slotId].status='completed';
    r.timer=null;r.completion={id:timer.slotId,at:now.toISOString(),shiftId:timer.shiftId,announced:true};
    changed=true;
    if(!sleeping&&work.schedule.enabled&&work.schedule.mode!=='off'&&!r.paused&&!status?.finished&&!status?.skipped)notices.push({kind:'completion',id:timer.slotId});
  }
  const shift=currentShift(work.schedule,now);
  if(!shift||!work.schedule.enabled||work.schedule.mode==='off')return {changed,notices};
  const status=shiftState(work,shift);
  const suppressed=sleeping||r.paused||status.finished||status.skipped;
  const slots=slotsFor(work.schedule,shift).filter(s=>Date.parse(s.at)<=+now);
  const latest=slots.find(slot=>status.slots[slot.id]?.status==='snoozed')||slots.at(-1);
  for(const slot of slots){
    const entry=status.slots[slot.id];
    if(entry&&['completed','started','missed'].includes(entry.status))continue;
    if(suppressed||slot.id!==latest!.id||(!entry&&+now-Date.parse(slot.at)>30*60000)){
      status.slots[slot.id]={status:'missed'};changed=true;continue;
    }
    if(entry?.status==='offered')continue;
    if(entry?.status==='snoozed'&&Date.parse(entry.until!)>+now)continue;
    if(r.timer)continue;
    status.slots[slot.id]={status:'offered',offeredAt:now.toISOString()};changed=true;notices.push({kind:'reminder',id:slot.id,shift});
  }
  // Retain a month of idempotency records, not an indefinite work history.
  const cutoff=new Date(+now);cutoff.setDate(cutoff.getDate()-35);
  for(const id of Object.keys(r.shifts))if(id<day(cutoff)){delete r.shifts[id];changed=true;}
  return {changed,notices};
}
export function workAction(work:WorkState,action:WorkAction,now=new Date(),{minutes,slotId,sleeping=false}:{minutes?:number;slotId?:string;sleeping?:boolean}={}) {
  const r=work.runtime;
  if(action==='pause'){r.paused=true;advanceWork(work,now,sleeping);return;}
  if(action==='resume'){r.paused=false;return;}
  if(action==='dismiss'){r.completion=null;return;}
  if(action==='cancel'){if(r.timer){const t=r.timer;r.shifts[t.shiftId].slots[t.slotId].status='completed';r.timer=null;}return;}
  const shift=currentShift(work.schedule,now);if(!shift)throw Error('You are outside your configured shift.');
  const status=shiftState(work,shift);
  if(action==='finish'||action==='skip'){status[action==='finish'?'finished':'skipped']=true;for(const entry of Object.values(status.slots))if(['offered','snoozed'].includes(entry.status))entry.status='missed';return;}
  const offered=offeredBreak(work,now,sleeping);
  if(!offered||!slotId||offered.id!==slotId)throw Error('This reminder is no longer available.');
  if(action==='snooze'){status.slots[slotId]={status:'snoozed',until:new Date(Math.min(+now+15*60000,Date.parse(shift.end))).toISOString()};return;}
  if(action==='take'){
    if(!minutes||![5,10].includes(minutes))throw Error('Choose five or ten minutes.');
    status.slots[slotId]={status:'started'};r.completion=null;
    r.timer={shiftId:shift.id,slotId,start:now.toISOString(),end:new Date(+now+minutes*60000).toISOString(),minutes};return;
  }
  throw Error('Unknown work-break action.');
}
export function reminderText(style:CoachStyle,minutes:number,midpoint=true) {
  const intro={Supportive:midpoint?'You’ve made it halfway through your shift.':'You’ve been working for a while.',Calm:'A quiet moment to reset?',Motivational:'A small reset can be part of your day.',Funny:'Your brain might appreciate a tiny intermission.',Direct:'Time for an optional work break.'}[style]||'A small reset?';
  return `${intro} If your work allows, take ${minutes} minutes to step away, stretch, or get some water. Ready when you are.`;
}
