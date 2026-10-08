import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { currentShift, offeredBreak, reminderText, WorkAction } from '../services/workCore';
import { performWorkAction } from '../services/workRuntime';
import { syncWorkNotifications } from '../services/workNotifications';

export function WorkBreakCard() {
  const work=useStore(s=>s.work),sleeping=useStore(s=>s.isSleeping),style=useStore(s=>s.profile.coachStyle||'Supportive');
  const [now,setNow]=useState(new Date()),[error,setError]=useState('');
  useEffect(()=>{const interval=setInterval(()=>setNow(new Date()),work.runtime.timer?1000:15000);return ()=>clearInterval(interval);},[work.runtime.timer]);
  if(!work.schedule.enabled&&!work.runtime.timer)return null;
  const shift=currentShift(work.schedule,now),status=shift?work.runtime.shifts[shift.id]:null;
  const due=offeredBreak(work,now,sleeping),timer=work.runtime.timer;
  const act=(action:WorkAction,minutes?:number)=>{try{performWorkAction(action,{minutes,slotId:due?.id});setNow(new Date());setError('');void syncWorkNotifications().catch(()=>setError('Your change is saved. Device notifications could not be updated.'));}catch(err){setError((err as Error).message);}};
  const button=(text:string,action:WorkAction,minutes?:number)=> <Pressable key={text} accessibilityRole="button" accessibilityLabel={text} onPress={()=>act(action,minutes)} style={styles.button}><Text style={styles.buttonText}>{text}</Text></Pressable>;
  let title='A little care during work.',message=shift?`Automatic midpoint: ${new Date(shift.midpoint).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}. Your break is always optional.`:'Your next workday will follow your saved schedule.';
  if(sleeping){title='Rest comes first.';message='Nimbo keeps work reminders quiet while you’re sleeping.';}
  else if(timer){const seconds=Math.min(timer.minutes*60,Math.max(0,Math.ceil((Date.parse(timer.end)-+now)/1000)));title=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} · a moment for you`;message='Stretch, get some water, or simply pause. The timer continues if you leave this screen.';}
  else if(work.runtime.completion){title='Break complete. Ready when you are.';message='No rush from Nimbo.';}
  else if(work.runtime.paused){title='Reminders paused.';message='Resume whenever they’re useful again.';}
  else if(status?.finished||status?.skipped){title=status.finished?'Workday finished.':'No more reminders this shift.';message='Nimbo gives you a little space, on your terms.';}
  else if(due){title='Nimbo: a quick reset?';message=reminderText(style,work.schedule.minutes,work.schedule.mode==='midpoint');}
  else if(work.schedule.mode==='off'){title='Break reminders are off.';message='You can change this in Work Schedule.';}
  else if(status){const snooze=Object.values(status.slots).find(s=>s.status==='snoozed');if(snooze){title='We’ll check in a little later.';message=`Snoozed until ${new Date(snooze.until!).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}. Only during this shift.`;}}
  return <View style={styles.card}><Text style={styles.eyebrow}>NIMBO · YOUR WORK COMPANION</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text><View style={styles.actions}>
    {!sleeping&&timer&&button('End break early','cancel')}
    {!sleeping&&!timer&&work.runtime.completion&&button('Got it','dismiss')}
    {!sleeping&&!timer&&!work.runtime.completion&&due&&<>{button(`Take ${work.schedule.minutes} minutes`,'take',work.schedule.minutes)}{button(`Take ${work.schedule.minutes===5?10:5} minutes`,'take',work.schedule.minutes===5?10:5)}{button('Remind me later · 15 min','snooze')}{button('Skip today','skip')}</>}
    {work.schedule.enabled&&button(work.runtime.paused?'Resume reminders':'Pause reminders',work.runtime.paused?'resume':'pause')}
    {shift&&!status?.finished&&!status?.skipped&&button('Workday finished','finish')}
  </View>{!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}</View>;
}
const styles=StyleSheet.create({card:{width:'100%',backgroundColor:'#ede9fe',borderRadius:18,padding:20,marginBottom:20},eyebrow:{fontSize:11,color:'#6d28d9',letterSpacing:1.5,fontWeight:'700',marginBottom:10},title:{fontSize:21,color:'#312e81',fontWeight:'700',marginBottom:10},message:{fontSize:14,lineHeight:22,color:'#475569',marginBottom:15},actions:{flexDirection:'row',flexWrap:'wrap',gap:8},button:{backgroundColor:'#fff',minHeight:44,paddingVertical:12,paddingHorizontal:14,borderRadius:10},buttonText:{fontSize:13,fontWeight:'600',color:'#5b21b6'},error:{color:'#b91c1c',marginTop:10}});
