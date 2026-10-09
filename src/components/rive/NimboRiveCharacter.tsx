import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';
import { useNimboActivity } from '../../hooks/useNimboActivity';
import { nimboController } from '../../services/nimboStateController';
import NimboRiveView from './NimboRiveView';

const subscribe = (notify: () => void) => nimboController.subscribe(() => notify());
const snapshot = () => nimboController.getState();

export default function NimboRiveCharacter({ asset, fallback }: { asset: number; fallback: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, snapshot, snapshot);
  const { ref, active, reduced } = useNimboActivity();
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  // Reduced motion uses the existing stable pose and stops/unmounts the rig.
  // The rig and raster engine are mutually exclusive, preventing double motion.
  if (failed || reduced) return <>{fallback}</>;
  return <View ref={ref} collapsable={false} testID="nimbo-rive-stage"
    style={{ height: 250, width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <NimboRiveView asset={asset} state={state} active={active} reduced={reduced} onFailure={onFailure} />
    <Text>{state}</Text>
  </View>;
}
