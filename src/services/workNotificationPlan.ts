import { WorkState, WorkNotice, shiftOn, slotsFor } from './workCore';
export type PlannedNotice=WorkNotice&{at:string};
export function workNotificationPlan(work:WorkState,sleeping:boolean,now=new Date()):PlannedNotice[] {
  const {schedule:s,runtime:r}=work;
  if(!s.enabled||!s.desktop||s.mode==='off'||sleeping||r.paused)return [];
  const result:PlannedNotice[]=[];
  if(r.timer&&Date.parse(r.timer.end)>+now){const status=r.shifts[r.timer.shiftId];if(!status?.finished&&!status?.skipped)result.push({kind:'completion',id:r.timer.slotId,at:r.timer.end});}
  for(let offset=-1;offset<=7;offset++){
    const anchor=new Date(+now);anchor.setDate(anchor.getDate()+offset);const shift=shiftOn(s,anchor);if(!shift||Date.parse(shift.end)<=+now)continue;
    const status=r.shifts[shift.id];if(status?.finished||status?.skipped)continue;
    for(const slot of slotsFor(s,shift)){
      const entry=status?.slots[slot.id];if(entry&&['completed','started','missed','offered'].includes(entry.status))continue;
      const at=entry?.status==='snoozed'?entry.until!:slot.at;
      if(Date.parse(at)<=+now||Date.parse(at)>=Date.parse(shift.end))continue;
      if(r.timer&&Date.parse(at)<=Date.parse(r.timer.end))continue;
      result.push({kind:'reminder',id:slot.id,at,shift});
    }
  }
  return result.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(0,48);
}
