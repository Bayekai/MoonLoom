import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { AIService } from '../services/aiService';
import { nimboController } from '../services/nimboStateController';
import { Nimbo } from '../components/Nimbo';

export default function CoachScreen() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'nimbo', text: string}[]>([
    { role: 'nimbo', text: "Hi! How are you feeling today? (Try typing 'tired' or 'good')" }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setChat(prev => [...prev, { role: 'user', text: input }]);

    // Mock AI Processing
    AIService.recordContext(input);
    const intent = AIService.generateIntent(input);
    nimboController.setState(intent);

    // Add Nimbo Response
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'nimbo', text: `I noticed you're feeling ${intent}. I've logged this to our memory!` }]);
    }, 500);

    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Coach</Text>
      <Nimbo />

      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 10 }}>
        {chat.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.nimboBubble]}>
            <Text style={styles.bubbleText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Talk to Nimbo..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bubble: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#8b5cf6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  nimboBubble: {
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  bubbleText: {
    color: '#1e293b',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});