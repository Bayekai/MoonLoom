import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useStore, WorkBreak } from '../store/useStore';
import { WorkService } from '../services/workService';
import { router } from 'expo-router';
import { nimboController } from '../services/nimboStateController';

export default function WorkScreen() {
  const profile = useStore(state => state.profile);
  const workBreaks = useStore(state => state.workBreaks);

  const [start, setStart] = useState(profile.shiftStart || '09:00');
  const [end, setEnd] = useState(profile.shiftEnd || '17:00');

  const handleSaveShift = () => {
    useStore.getState().updateProfile({ shiftStart: start, shiftEnd: end });

    // Create today's dates based on time inputs
    const today = new Date();
    const [sH, sM] = start.split(':');
    const startDate = new Date(today);
    startDate.setHours(parseInt(sH), parseInt(sM), 0);

    const [eH, eM] = end.split(':');
    const endDate = new Date(today);
    endDate.setHours(parseInt(eH), parseInt(eM), 0);

    const wb = WorkService.scheduleMidShiftBreak(startDate.toISOString(), endDate.toISOString());
    Alert.alert("Shift Saved", `Mid-shift break scheduled for: ${new Date(wb.scheduledTime).toLocaleTimeString()}`);
  };

  const handleTakeBreak = (wb: WorkBreak) => {
    useStore.getState().updateWorkBreak(wb.id, 'completed');
    useStore.getState().addFood(1); // Reward for taking a break
    nimboController.setState('BREAK_TIME');
    Alert.alert("Break Time!", "Nimbo is relaxing. You earned Dry Food.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Work Schedule</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configure Shift</Text>
        <Text style={styles.label}>Shift Start (HH:MM)</Text>
        <TextInput style={styles.input} value={start} onChangeText={setStart} />

        <Text style={styles.label}>Shift End (HH:MM)</Text>
        <TextInput style={styles.input} value={end} onChangeText={setEnd} />

        <TouchableOpacity style={styles.btn} onPress={handleSaveShift}>
            <Text style={styles.btnText}>Save & Schedule Break</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scheduled Breaks</Text>
        {workBreaks.length === 0 ? (
          <Text style={{color: '#64748b'}}>No breaks scheduled yet.</Text>
        ) : (
          workBreaks.map(wb => (
            <View key={wb.id} style={styles.wbItem}>
              <Text style={{fontWeight: 'bold'}}>Mid-Shift Break</Text>
              <Text>Time: {new Date(wb.scheduledTime).toLocaleTimeString()}</Text>
              <Text>Status: {wb.status}</Text>
              {wb.status === 'scheduled' && (
                  <TouchableOpacity style={styles.takeBreakBtn} onPress={() => handleTakeBreak(wb)}>
                      <Text style={styles.btnText}>Take Break (+1 Food)</Text>
                  </TouchableOpacity>
              )}
            </View>
          ))
        )}
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
  btn: {
      backgroundColor: '#8b5cf6',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
  },
  takeBreakBtn: {
      backgroundColor: '#10b981', // green for action
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
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
  },
  wbItem: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  }
});