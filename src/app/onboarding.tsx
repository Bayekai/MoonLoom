import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useStore } from '../store/useStore';
import { router } from 'expo-router';
import { Cloud } from 'lucide-react-native';

export default function OnboardingScreen() {
  const [goal, setGoal] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // If already onboarded, send back to home
  const onboarded = useStore(state => state.profile.onboarded);
  useEffect(() => {
      if (onboarded) {
          router.replace('/');
      }
  }, [onboarded]);

  const handleComplete = () => {
      useStore.getState().updateProfile({
          primaryGoal: goal || 'Understand sleep',
          timezone: timezone,
          onboarded: true
      });
      router.replace('/');
  };

  if (onboarded) return null; // Avoid flicker

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Cloud size={100} color="#a78bfa" style={{marginBottom: 20}} />
      <Text style={styles.header}>Welcome to Moonloom</Text>
      <Text style={styles.sub}>I&apos;m Nimbo. Let&apos;s find the sleep routine that actually works for you.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>What is your primary goal?</Text>
        <TextInput
            style={styles.input}
            value={goal}
            onChangeText={setGoal}
            placeholder="e.g. Wake up easier, More energy..."
        />

        <Text style={styles.label}>Timezone</Text>
        <TextInput
            style={styles.input}
            value={timezone}
            onChangeText={setTimezone}
        />

        <TouchableOpacity style={styles.btn} onPress={handleComplete}>
            <Text style={styles.btnText}>Start My Journey</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1e1b4b', // Deep celestial night
    padding: 20,
    paddingTop: 80,
    alignItems: 'center'
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center'
  },
  sub: {
      color: '#c4b5fd',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 40,
      paddingHorizontal: 20
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 5,
  },
  label: {
      color: '#334155',
      marginBottom: 5,
      fontWeight: 'bold'
  },
  input: {
      backgroundColor: '#f1f5f9',
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      color: '#1e293b'
  },
  btn: {
      backgroundColor: '#8b5cf6',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
  },
  btnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16
  }
});
