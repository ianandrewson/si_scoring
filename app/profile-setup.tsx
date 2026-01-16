import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createAndActivateProfile } = useApp();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    setLoading(true);
    try {
      const profile = await createAndActivateProfile(name.trim());
      if (profile) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Welcome to Spirit Island Scoring
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Create a profile to get started tracking your games
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Profile Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <Button
              title="Create Profile"
              onPress={handleCreate}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
  },
});
