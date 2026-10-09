import React, { lazy, Suspense, useCallback, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Nimbo } from '../components/Nimbo';
import { useNimboActivity } from '../hooks/useNimboActivity';

const RiveView = lazy(() => import('../components/rive/NimboRiveView'));
// Metro needs a literal require for bundled .riv files.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const REVIEW_ASSET: number = require('../../assets/nimbo/rive/nimbo-idle-candidate.riv');
class PreviewBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function NimboRiveReview() {
  const { ref, active, reduced: systemReduced } = useNimboActivity();
  const [previewReduced, setPreviewReduced] = useState(false);
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  if (!__DEV__) return <Text>Rive prototype review is available in development only.</Text>;
  const reduced = systemReduced || previewReduced;
  const fallback = <><Text>Original artwork fallback · Rive preview unavailable.</Text>
    <Nimbo reviewKit reviewState="NEUTRAL" reviewBlink reviewReduced={reduced}/></>;
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 16, backgroundColor: '#efe8dc' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Nimbo Rive idle prototype</Text>
    <Text>Unapproved candidate. Production still uses the existing Nimbo renderer.</Text>
    <View ref={ref} collapsable={false} style={{ height: 250, alignItems: 'center', justifyContent: 'center' }}>
      {failed ? fallback : reduced ? <Nimbo reviewKit reviewState="NEUTRAL" reviewBlink reviewReduced/> :
        <PreviewBoundary fallback={fallback} onFailure={onFailure}><Suspense fallback={<Text>Loading Rive candidate…</Text>}>
          <RiveView asset={REVIEW_ASSET} state="NEUTRAL"
            active={active} reduced={false} onFailure={onFailure}/>
        </Suspense></PreviewBoundary>}
    </View>
    <Text testID="nimbo-rive-status">{failed ? 'Fallback' : reduced ? 'Stable original pose · reduced motion' : active ? 'Rive candidate active' : 'Rive paused while inactive'}</Text>
    <View><Text>Preview reduced motion</Text><Switch accessibilityLabel="Preview Rive reduced motion" value={previewReduced} onValueChange={setPreviewReduced}/></View>
    <Text>Existing five-frame blink, localized ear and tail mesh movement, and chest breathing. No whole-character bouncing.</Text>
    <Text>Walking, chewing, resting pose, paw stretch, happy and tap expressions are still pending. Known blink edge artifacts and pose drift remain.</Text>
    <Text>This preview does not change food, sleep data or the Nimbo state controller.</Text>
    <Link href="/nimbo-review">Return to existing animation review</Link>
    <View style={{ height: 700 }}/><Text>Scroll the candidate offscreen to pause it.</Text>
  </ScrollView>;
}
