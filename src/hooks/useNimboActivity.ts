import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Dimensions, Platform, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useNimboActivity() {
  const ref=useRef<View>(null);
  const [focused,setFocused]=useState(false);
  useFocusEffect(useCallback(()=>{setFocused(true);return ()=>setFocused(false);},[]));
  const [foreground,setForeground]=useState(AppState.currentState==='active');
  const [visible,setVisible]=useState(false);
  const [reduced,setReduced]=useState(true);
  useEffect(()=>{
    let mounted=true;
    const update=(value:boolean)=>{if(mounted)setReduced(value);};
    AccessibilityInfo.isReduceMotionEnabled().then(update).catch(()=>update(true));
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',update);
    const app=AppState.addEventListener('change',value=>setForeground(value==='active'));
    return ()=>{mounted=false;motion.remove();app.remove();};
  },[]);
  useEffect(()=>{
    if(Platform.OS!=='web')return;
    const update=()=>setForeground(document.visibilityState==='visible');
    update();document.addEventListener('visibilitychange',update);
    return ()=>document.removeEventListener('visibilitychange',update);
  },[]);
  useEffect(()=>{
    if(!focused || !foreground)return;
    let disposed=false;
    if(Platform.OS==='web'){
      const node=ref.current as unknown as Element;
      if(!node)return;
      const observer=new IntersectionObserver(entries=>{if(!disposed)setVisible(entries[0]?.isIntersecting??false);});
      observer.observe(node);
      return ()=>{disposed=true;observer.disconnect();};
    }
    const measure=()=>ref.current?.measureInWindow((x,y,width,height)=>{
      const window=Dimensions.get('window');
      if(!disposed)setVisible(width>0 && height>0 && x+width>0 && y+height>0 && x<window.width && y<window.height);
    });
    measure();const timer=setInterval(measure,500);
    return ()=>{disposed=true;clearInterval(timer);};
  },[focused,foreground]);
  return {ref,active:focused && foreground && visible,reduced};
}
