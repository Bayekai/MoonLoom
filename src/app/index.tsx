import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { Nimbo } from '../components/Nimbo';
import { nimboController } from '../services/nimboStateController';
import { SleepTrackerService } from '../services/sleepTracker';
import { router } from 'expo-router';

export default function HomeScreen() {
  const foodBalance = useStore(state => state.profile.foodBalance);
  const sleepSessions = useStore(state => state.sleepSessions);

  const simulateGoingToSleep = () => {
    nimboController.setState('SLEEPY');
    setTimeout(() => {
      nimboController.setState('SLEEPING');
    }, 2000);
  };

  const simulateWakeUp = () => {
    nimboController.setState('WAKING');
    setTimeout(() => {
      nimboController.setState('HAPPY'); // In real app, derived from sleep logic
    }, 2000);
  };

  const feedNimbo = () => {
    if (foodBalance > 0) {
      const currentState = nimboController.getState();
      useStore.getState().addFood(-1);
      nimboController.setState('EATING');

      setTimeout(() => {
        nimboController.setState('HAPPY');
        setTimeout(() => nimboController.setState(currentState), 2000);
      }, 2000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Moonloom</Text>

      <Nimbo />

      <View style={styles.statsCard}>
        <Text style={styles.statsText}>Dry Food: {foodBalance}</Text>
        <Text style={styles.statsText}>Avg Sleep: {(SleepTrackerService.getAverageDurationMs() / (1000 * 60 * 60)).toFixed(1)} hrs</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/log')}>
          <Text style={styles.buttonText}>Log Sleep & Lifestyle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/work')}>
          <Text style={styles.buttonText}>Work Schedule & Breaks</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, {flex: 1}]} onPress={simulateGoingToSleep}>
            <Text style={styles.buttonText}>Going to Sleep</Text>
          </TouchableOpacity>
          <View style={{width: 10}} />
          <TouchableOpacity style={[styles.button, {flex: 1, backgroundColor: '#f59e0b'}]} onPress={simulateWakeUp}>
            <Text style={styles.buttonText}>I'm Awake</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, foodBalance <= 0 && styles.buttonDisabled]} onPress={feedNimbo} disabled={foodBalance <= 0}>
          <Text style={styles.buttonText}>Feed Nimbo (Cost: 1 Food)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  statsText: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});