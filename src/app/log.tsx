import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useStore, LifestyleEvent } from '../store/useStore';
import { SleepTrackerService } from '../services/sleepTracker';
import { nimboController } from '../services/nimboStateController';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';

export default function LogScreen() {
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [rating, setRating] = useState('Okay');
  const [lifestyleType, setLifestyleType] = useState('');
  const [lifestyleVal, setLifestyleVal] = useState('');

  const handleLogSleep = () => {
    // Basic string parse for demo MVP
    const today = new Date();
    const [bHours, bMins] = bedtime.split(':');
    const bedDate = new Date(today);
    bedDate.setHours(parseInt(bHours), parseInt(bMins), 0);
    // If bedtime is after noon, assume it was yesterday
    if (parseInt(bHours) > 12) {
        bedDate.setDate(bedDate.getDate() - 1);
    }

    const [wHours, wMins] = wakeTime.split(':');
    const wakeDate = new Date(today);
    wakeDate.setHours(parseInt(wHours), parseInt(wMins), 0);

    SleepTrackerService.logSleep(bedDate.toISOString(), wakeDate.toISOString());

    // Map rating to Nimbo state
    if (rating === 'Excellent' || rating === 'Good') nimboController.setState('ENERGETIC');
    if (rating === 'Okay') nimboController.setState('HAPPY');
    if (rating === 'Tired' || rating === 'Exhausted') nimboController.setState('TIRED');

    Alert.alert("Sleep Logged", `Logged sleep and awarded Dry Food.`);
  };

  const handleLogLifestyle = () => {
    if (!lifestyleType) return;
    const ev: LifestyleEvent = {
        id: Crypto.randomUUID(),
        userId: useStore.getState().profile.id,
        type: lifestyleType,
        value: lifestyleVal,
        timestamp: new Date().toISOString()
    };
    useStore.getState().addLifestyleEvent(ev);
    useStore.getState().addFood(1); // Reward
    setLifestyleType('');
    setLifestyleVal('');
    Alert.alert("Event Logged", `Logged ${ev.type} and awarded Dry Food.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Manual Logging</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log Sleep</Text>
        <Text style={styles.label}>Bedtime (HH:MM)</Text>
        <TextInput style={styles.input} value={bedtime} onChangeText={setBedtime} />

        <Text style={styles.label}>Wake Time (HH:MM)</Text>
        <TextInput style={styles.input} value={wakeTime} onChangeText={setWakeTime} />

        <Text style={styles.label}>Morning Feeling</Text>
        <View style={styles.row}>
            {['Exhausted', 'Tired', 'Okay', 'Good', 'Excellent'].map(r => (
                <TouchableOpacity
                    key={r}
                    style={[styles.ratingBtn, rating === r && styles.activeRating]}
                    onPress={() => setRating(r)}
                >
                    <Text style={rating === r ? {color: 'white'} : {}}>{r}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogSleep}>
            <Text style={styles.btnText}>Log Sleep</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log Lifestyle Event</Text>
        <Text style={styles.label}>Event Type (e.g. Caffeine, Exercise)</Text>
        <TextInput style={styles.input} value={lifestyleType} onChangeText={setLifestyleType} />

        <Text style={styles.label}>Value / Time</Text>
        <TextInput style={styles.input} value={lifestyleVal} onChangeText={setLifestyleVal} />

        <TouchableOpacity style={styles.btn} onPress={handleLogLifestyle}>
            <Text style={styles.btnText}>Log Event</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Back to Home</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#334155'
  },
  label: {
      color: '#64748b',
      marginBottom: 5,
  },
  input: {
      backgroundColor: '#f1f5f9',
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
  },
  row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginBottom: 15,
  },
  ratingBtn: {
      padding: 8,
      borderRadius: 15,
      backgroundColor: '#f1f5f9',
  },
  activeRating: {
      backgroundColor: '#8b5cf6',
  },
  btn: {
      backgroundColor: '#8b5cf6',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
  },
  backBtn: {
      backgroundColor: '#64748b',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
  },
  btnText: {
      color: 'white',
      fontWeight: 'bold'
  }
});