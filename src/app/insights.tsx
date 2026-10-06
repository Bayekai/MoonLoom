import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { ExperimentEngine } from '../services/experimentEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InsightsScreen() {
  const experiments = useStore(state => state.experiments);
  const memoryCount = useStore(state => state.aiMemory.length);
  const sleepCount = useStore(state => state.sleepSessions.length);

  const startDemoExperiment = () => {
    ExperimentEngine.startExperiment("No screens 30m before bed", 7);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your offline sleep data, AI memory, and Nimbo progress. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            // Reset zustand
            useStore.persist.clearStorage();
            Alert.alert("Data Cleared", "Please restart the app.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Insights & Privacy</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Summary</Text>
        <Text>Sleep Sessions: {sleepCount}</Text>
        <Text>AI Memories: {memoryCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Experiments</Text>
        {experiments.length === 0 ? (
          <Text style={{color: '#64748b'}}>No active experiments.</Text>
        ) : (
          experiments.map(exp => (
            <View key={exp.id} style={styles.expItem}>
              <Text style={{fontWeight: 'bold'}}>{exp.variable}</Text>
              <Text>Duration: {exp.durationDays} days</Text>
              <Text>Status: {exp.status}</Text>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={startDemoExperiment}>
          <Text style={styles.actionText}>Start Screen Demo Exp.</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, {borderColor: '#ef4444', borderWidth: 1}]}>
        <Text style={[styles.cardTitle, {color: '#ef4444'}]}>Privacy Controls</Text>
        <Text style={{marginBottom: 15, color: '#64748b'}}>Moonloom stores data locally. You control your data.</Text>
        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ef4444'}]} onPress={handleClearData}>
          <Text style={styles.actionText}>Delete All Local Data</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 10,
    color: '#334155'
  },
  expItem: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold'
  }
});