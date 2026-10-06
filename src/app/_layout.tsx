import { Tabs, router, useSegments } from 'expo-router';
import { Cloud, List, Settings } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function Layout() {
  const onboarded = useStore(state => state.profile?.onboarded);
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isAuthGroup = segments[0] === 'onboarding';

    // If not onboarded and not currently on the onboarding screen
    if (!onboarded && !isAuthGroup) {
      router.replace('/onboarding');
    }
  }, [onboarded, segments, mounted]);

  // Don't render layout until client side state is mounted
  if (!mounted) return <View style={{flex:1, backgroundColor: '#1e1b4b'}} />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#8b5cf6',
      tabBarInactiveTintColor: '#9ca3af',
      // Hide tab bar on sub-screens and onboarding
      tabBarStyle: {
        display: (segments[0] === 'onboarding' || segments[0] === 'log' || segments[0] === 'work') ? 'none' : 'flex'
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Cloud color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />

      {/* Hidden routes from Tab bar */}
      <Tabs.Screen name="log" options={{ href: null }} />
      <Tabs.Screen name="work" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
    </Tabs>
  );
}