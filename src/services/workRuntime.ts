import { useStore } from '../store/useStore';
import { advanceWork, migrateWork, workAction, WorkAction, WorkState } from './workCore';
import { nimboController } from './nimboStateController';

export function tickWork(now=new Date()) {
  const state=useStore.getState();
  const work=JSON.parse(JSON.stringify(state.work)) as WorkState;
  migrateWork({work});
  const result=advanceWork(work,now,state.isSleeping);
  if(result.changed)useStore.getState().setWork(work);
  return result.notices;
}
export function performWorkAction(action:WorkAction,options:{minutes?:number;slotId?:string}={},now=new Date()) {
  const state=useStore.getState();
  const work=JSON.parse(JSON.stringify(state.work)) as WorkState;
  workAction(work,action,now,{...options,sleeping:state.isSleeping});
  useStore.getState().setWork(work);
  if(action==='take'&&!state.isSleeping)nimboController.setState('BREAK_TIME');
  if(action==='cancel'&&nimboController.getState()==='BREAK_TIME')nimboController.setState('CALM');
}
