import React, { useEffect } from 'react';
import { Image, Pressable } from 'react-native';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { canTapRive, NIMBO_RIVE_CONTRACT as contract, NIMBO_RIVE_STATES, type NimboRiveViewProps } from './nimboRiveContract';

// Metro selects the .native adapter on Android/iOS; this canvas adapter is web only.
export default function NimboRiveView({ asset, state, active, reduced, onFailure }: NimboRiveViewProps) {
  const { rive, RiveComponent } = useRive({
    src: Image.resolveAssetSource(asset).uri, artboard: contract.artboard,
    stateMachines: contract.stateMachine, autoplay: false, autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: onFailure,
  });
  useEffect(() => {
    if (!rive) return;
    const instance = rive.viewModelInstance;
    const stateProperty = instance?.number('state');
    const reducedProperty = instance?.boolean('reducedMotion');
    if (!stateProperty || !reducedProperty || !instance?.trigger('tap')) { onFailure(); return; }
    stateProperty.value = NIMBO_RIVE_STATES[state];
    reducedProperty.value = reduced;
    if (active && !reduced) rive.play();
    else rive.pause();
    return () => rive.pause();
  }, [rive, state, active, reduced, onFailure]);
  return <Pressable accessibilityRole="button" accessibilityLabel="Pet Nimbo" onPress={() => {
    if (canTapRive(state, active, reduced)) rive?.viewModelInstance?.trigger('tap')?.trigger();
  }}>
    <RiveComponent style={{ width: 240, height: 197 }} />
  </Pressable>;
}
