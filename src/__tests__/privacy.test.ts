import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import { clearMoonloomData } from '../services/privacy';
import { nimboActions } from '../services/nimboActions';
import { nimboController } from '../services/nimboStateController';
jest.mock('../services/workNotifications', () => ({ syncWorkNotifications: jest.fn(async () => {}) }));

test('privacy reset clears live progress and pending actions without clearing unrelated keys', async () => {
  jest.useFakeTimers();
  const storage = new Map<string, string>();
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => { storage.set(key, value); });
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => storage.get(key) ?? null);
  jest.mocked(AsyncStorage.removeItem).mockImplementation(async key => { storage.delete(key); });
  jest.mocked(AsyncStorage.clear).mockImplementation(async () => { storage.clear(); });
  await AsyncStorage.setItem('unrelated-setting', 'preserve');
  useStore.getState().updateProfile({ onboarded: true, foodBalance: 10 });
  useStore.getState().addMemory({ id: 'test', userId: 'u1', context: 'test', timestamp: new Date().toISOString() });
  nimboActions.feed();
  await clearMoonloomData();
  jest.runAllTimers();
  expect(useStore.getState().profile.onboarded).toBe(false);
  expect(useStore.getState().profile.foodBalance).toBe(0);
  expect(useStore.getState().aiMemory).toEqual([]);
  expect(nimboController.getState()).toBe('NEUTRAL');
  expect(await AsyncStorage.getItem('unrelated-setting')).toBe('preserve');
  jest.useRealTimers();
});
