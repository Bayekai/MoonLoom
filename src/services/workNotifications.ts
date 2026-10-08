// Web preview adapter. Native builds resolve workNotifications.native.ts.
import { WorkNotice, reminderText } from './workCore';
import { useStore } from '../store/useStore';
export async function requestWorkPermission():Promise<boolean> {
  if(typeof Notification==='undefined')return false;
  return await Notification.requestPermission()==='granted';
}
export async function syncWorkNotifications():Promise<void> {}
export async function deliverWorkNotice(notice:WorkNotice):Promise<void> {
  const {work,profile,isSleeping}=useStore.getState();
  if(typeof document==='undefined'||!document.hidden||typeof Notification==='undefined'||Notification.permission!=='granted'||!work.schedule.desktop||isSleeping||work.runtime.paused)return;
  const body=notice.kind==='completion'?'Break complete. Ready when you are.':reminderText(profile.coachStyle||'Supportive',work.schedule.minutes,work.schedule.mode==='midpoint');
  const notification=new Notification('Nimbo · Moonloom',{body,tag:`moonloom-work-${notice.id}`,silent:true});
  notification.onclick=()=>{window.focus();notification.close();};
}
