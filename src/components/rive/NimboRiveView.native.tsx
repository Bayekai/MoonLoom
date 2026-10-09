import React, { useEffect } from 'react';
import { Image, Pressable } from 'react-native';
import { Fit, RiveView, useRive, useRiveFile, useViewModelInstance } from '@rive-app/react-native';
import { canTapRive, NIMBO_RIVE_CONTRACT as contract, NIMBO_RIVE_STATES, type NimboRiveViewProps } from './nimboRiveContract';

export default function NimboRiveView({ asset, state, active, reduced, onFailure }: NimboRiveViewProps) {
  const { riveFile, error } = useRiveFile(Image.resolveAssetSource(asset).uri);
  const { instance, error: bindingError, isLoading } = useViewModelInstance(riveFile, {
    async: true, viewModelName: contract.viewModel,
  });
  const { riveViewRef, setHybridRef } = useRive();

  useEffect(() => {
    if (error || bindingError || (riveFile && !isLoading && !instance)) onFailure();
  }, [error, bindingError, riveFile, isLoading, instance, onFailure]);

  useEffect(() => {
    if (!riveViewRef || !instance) return;
    let cancelled = false;
    const apply = async () => {
      if (!await riveViewRef.awaitViewReady() || cancelled) return;
      const stateProperty = instance.numberProperty('state');
      const reducedProperty = instance.booleanProperty('reducedMotion');
      if (!stateProperty || !reducedProperty || !instance.triggerProperty('tap')) throw new Error('Nimbo rig contract mismatch');
      await stateProperty.setValueAsync(NIMBO_RIVE_STATES[state]);
      await reducedProperty.setValueAsync(reduced);
      if (cancelled) return;
      if (active && !reduced) await riveViewRef.play();
      else await riveViewRef.pause();
    };
    void apply().catch(() => { if (!cancelled) onFailure(); });
    return () => { cancelled = true; void riveViewRef.pause().catch(() => {}); };
  }, [riveViewRef, instance, state, active, reduced, onFailure]);

  if (!riveFile || !instance) return null;
  return <Pressable accessibilityRole="button" accessibilityLabel="Pet Nimbo" onPress={() => {
    if (canTapRive(state, active, reduced)) instance.triggerProperty('tap')?.trigger();
  }}>
    <RiveView file={riveFile} dataBind={instance} artboardName={contract.artboard}
      stateMachineName={contract.stateMachine} hybridRef={setHybridRef} fit={Fit.Contain}
      autoPlay={false} onError={onFailure} style={{ width: 240, height: 197 }} />
  </Pressable>;
}
