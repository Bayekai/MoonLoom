import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { nimboController, NimboState } from '../services/nimboStateController';
import { Cloud, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Star, Sun, Zap } from 'lucide-react-native';

export function Nimbo() {
  const [state, setState] = useState<NimboState>(nimboController.getState());

  useEffect(() => {
    const unsubscribe = nimboController.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const renderIcon = () => {
    switch (state) {
      case 'SLEEPING': return <CloudMoon size={100} color="#8b5cf6" />;
      case 'HAPPY': return <CloudSun size={100} color="#f59e0b" />;
      case 'ENERGETIC': return <CloudLightning size={100} color="#fbbf24" />;
      case 'TIRED': return <CloudFog size={100} color="#9ca3af" />;
      case 'STRESSED': return <CloudRain size={100} color="#6b7280" />;
      case 'WAKING': return <Sun size={100} color="#fcd34d" />;
      case 'CELEBRATING': return <Star size={100} color="#fbbf24" />;
      case 'BREAK_TIME': return <CloudSnow size={100} color="#93c5fd" />;
      case 'EATING': return <Moon size={100} color="#c4b5fd" />;
      case 'CALM': return <Cloud size={100} color="#a78bfa" />;
      default: return <Cloud size={100} color="#e5e7eb" />;
    }
  };

  return (
    <View style={styles.container}>
      {renderIcon()}
      <Text style={styles.stateText}>{state}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginVertical: 20,
  },
  stateText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  }
});