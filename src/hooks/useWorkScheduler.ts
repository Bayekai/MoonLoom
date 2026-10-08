import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useStore } from '../store/useStore';
import { tickWork } from '../services/workRuntime';
import { nimboController } from '../services/nimboStateController';
import { deliverWorkNotice, syncWorkNotifications } from '../services/workNotifications';

export function useWorkScheduler() {
  useEffect(()=>{
    let busy=false,rerun=false,alive=true;
    const tick=async()=>{
      if(!alive)return;
      if(busy){rerun=true;return;}
      if(!useStore.persist.hasHydrated()||!useStore.getState().profile.onboarded)return;
      busy=true;
      try{
        const notices=tickWork();
        const {work,isSleeping}=useStore.getState();
        if(isSleeping&&!['SLEEPING','SLEEPY','EATING'].includes(nimboController.getState()))nimboController.setState('SLEEPING');
        if(work.runtime.timer&&!isSleeping&&nimboController.getState()!=='BREAK_TIME')nimboController.setState('BREAK_TIME');
        if(!work.runtime.timer&&nimboController.getState()==='BREAK_TIME')nimboController.setState(isSleeping?'SLEEPING':'CALM');
        await syncWorkNotifications();
        for(const notice of notices)await deliverWorkNotice(notice);
      }catch{console.warn('Work reminders unavailable; your in-app controls remain available.');}
      finally{busy=false;if(rerun){rerun=false;void tick();}}
    };
    const timer=setInterval(tick,15000);
    const app=AppState.addEventListener('change',state=>{if(state==='active')void tick();});
    const unsubscribe=useStore.subscribe(()=>{void tick();});
    const hydration=useStore.persist.onFinishHydration(()=>{void tick();});
    void tick();
    return ()=>{alive=false;clearInterval(timer);app.remove();unsubscribe();hydration();};
  },[]);
}
