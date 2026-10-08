import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { WorkNotice, reminderText } from './workCore';
import { useStore } from '../store/useStore';
import { workNotificationPlan } from './workNotificationPlan';
const prefix='moonloom-work-';let fingerprint='';let queue=Promise.resolve();
Notifications.setNotificationHandler({handleNotification:async()=>{
  const {work,isSleeping}=useStore.getState();
  const show=work.schedule.enabled&&work.schedule.desktop&&!work.runtime.paused&&!isSleeping&&AppState.currentState!=='active';
  return {shouldShowBanner:show,shouldShowList:show,shouldPlaySound:false,shouldSetBadge:false};
}});
export async function requestWorkPermission():Promise<boolean> {
  if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('moonloom-work',{name:'Nimbo work breaks',importance:Notifications.AndroidImportance.DEFAULT,sound:null,enableVibrate:false});
  const result=await Notifications.requestPermissionsAsync();fingerprint='';return result.granted;
}
async function reconcile():Promise<void> {
  const {work,isSleeping,profile}=useStore.getState();
  const desired=workNotificationPlan(work,isSleeping).map(n=>({identifier:prefix+n.kind+'-'+n.id,at:n.at,body:n.kind==='completion'?'Break complete. Ready when you are.':reminderText(profile.coachStyle||'Supportive',work.schedule.minutes,work.schedule.mode==='midpoint')}));
  const next=JSON.stringify(desired);if(next===fingerprint)return;
  const scheduled=await Notifications.getAllScheduledNotificationsAsync();
  for(const notification of scheduled)if(notification.identifier.startsWith(prefix))await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  if((await Notifications.getPermissionsAsync()).granted){for(const n of desired)await Notifications.scheduleNotificationAsync({identifier:n.identifier,content:{title:'Nimbo · Moonloom',body:n.body,sound:false,data:{moonloomWork:true,at:n.at}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(n.at),channelId:'moonloom-work'}});}
  fingerprint=next;
}
export function syncWorkNotifications():Promise<void> {const job=queue.then(reconcile);queue=job.catch(()=>{});return job;}
export async function deliverWorkNotice(_notice:WorkNotice):Promise<void> {}
