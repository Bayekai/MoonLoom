import { useStore } from '../store/useStore';
import { defaultWork } from './workCore';
import { nimboActions } from './nimboActions';
import { syncWorkNotifications } from './workNotifications';

export async function clearMoonloomData() {
  // Clear only this app's key, then reset live state so it cannot re-save old data.
  await useStore.persist.clearStorage();
  nimboActions.reset();
  const initial = useStore.getInitialState();
  useStore.setState({ ...initial, profile: { ...initial.profile, createdAt: new Date().toISOString() }, work: defaultWork() });
  await syncWorkNotifications();
}
