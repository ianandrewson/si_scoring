import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { ImagePicker } from '@/components/ImagePicker';
import { useApp } from '@/contexts/AppContext';
import { useGames } from '@/hooks/useGames';

export default function AddGameScreen() {
  const { activeProfile } = useApp();
  const { createGame } = useGames();

  const [date, setDate] = useState(new Date());
  const [players, setPlayers] = useState('');
  const [spirits, setSpirits] = useState('');
  const [win, setWin] = useState(false);
  const [adversary, setAdversary] = useState('');
  const [adversaryDifficulty, setAdversaryDifficulty] = useState('');
  const [scenario, setScenario] = useState('');
  const [scenarioDifficulty, setScenarioDifficulty] = useState('');
  const [invaderCards, setInvaderCards] = useState('');
  const [dahan, setDahan] = useState('');
  const [blight, setBlight] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!activeProfile) {
      Alert.alert('Error', 'No active profile selected');
      return;
    }

    if (!players.trim() || !spirits.trim()) {
      Alert.alert('Error', 'Please enter players and spirits');
      return;
    }

    const playerList = players
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const spiritList = spirits
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (playerList.length === 0 || spiritList.length === 0) {
      Alert.alert('Error', 'Please enter valid players and spirits');
      return;
    }

    setLoading(true);
    try {
      const game = await createGame({
        profileId: activeProfile.id,
        date: date.toISOString(),
        players: playerList,
        spirits: spiritList,
        win,
        adversary: adversary.trim() || null,
        adversaryDifficulty: adversaryDifficulty
          ? parseInt(adversaryDifficulty, 10)
          : null,
        scenario: scenario.trim() || null,
        scenarioDifficulty: scenarioDifficulty
          ? parseInt(scenarioDifficulty, 10)
          : null,
        invaderCards: parseInt(invaderCards, 10) || 0,
        dahan: parseInt(dahan, 10) || 0,
        blight: parseInt(blight, 10) || 0,
        notes: notes.trim(),
        pictures: images,
      });

      if (game) {
        router.replace(`/game/${game.id}?tab=stats`);
      } else {
        Alert.alert('Error', 'Failed to save game. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to save game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Game',
          presentation: 'modal',
        }}
      />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <DatePicker value={date} onChange={setDate} label="Date" />

            <View style={styles.field}>
              <ThemedText style={styles.label}>Players *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter player names (comma separated)"
                value={players}
                onChangeText={setPlayers}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Spirits *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter spirit names (comma separated)"
                value={spirits}
                onChangeText={setSpirits}
              />
            </View>

            <View style={styles.switchField}>
              <ThemedText style={styles.label}>Victory</ThemedText>
              <Switch value={win} onValueChange={setWin} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Adversary</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                value={adversary}
                onChangeText={setAdversary}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Adversary Difficulty</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0-10"
                value={adversaryDifficulty}
                onChangeText={setAdversaryDifficulty}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Scenario</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                value={scenario}
                onChangeText={setScenario}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Scenario Difficulty</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0-10"
                value={scenarioDifficulty}
                onChangeText={setScenarioDifficulty}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Invader Cards</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={invaderCards}
                onChangeText={setInvaderCards}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Dahan Remaining</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={dahan}
                onChangeText={setDahan}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Blight on Island</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={blight}
                onChangeText={setBlight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Notes</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional notes about this game"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <ImagePicker images={images} onImagesChange={setImages} />

            <Button
              title="Save Game"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
