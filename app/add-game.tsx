import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { ImagePicker } from '@/components/ImagePicker';
import { useApp } from '@/contexts/AppContext';
import { useGames } from '@/hooks/useGames';
import { SPIRITS } from '@/assets/static/spirits';
import { ADVERSARIES } from '@/assets/static/adversaries';
import { SCENARIOS } from '@/assets/static/scenarios';

export default function AddGameScreen() {
  const { activeProfile } = useApp();
  const { createGame, updateGame, getGameById } = useGames();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [date, setDate] = useState(new Date());
  const [players, setPlayers] = useState<string[]>(['']);
  const [spirits, setSpirits] = useState<Record<string, string>>({});
  const [win, setWin] = useState(false);
  const [adversary, setAdversary] = useState('');
  const [adversaryLevel, setAdversaryLevel] = useState(0);
  const [scenario, setScenario] = useState('');
  const [invaderCards, setInvaderCards] = useState('');
  const [dahan, setDahan] = useState('');
  const [blight, setBlight] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState<number | null>(null);

  const addPlayerInput = () => {
    setPlayers([...players, '']);
  };

  const updatePlayer = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const playerName = players[index];
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);

      // Remove spirit selection for this player
      if (playerName.trim()) {
        const newSpirits = { ...spirits };
        delete newSpirits[playerName.trim()];
        setSpirits(newSpirits);
      }
    }
  };

  const updateSpirit = (playerName: string, spiritName: string) => {
    setSpirits({ ...spirits, [playerName]: spiritName });
  };

  const spiritOptions = SPIRITS.map((spirit) => ({
    label: spirit.name,
    subtext: spirit.label,
    value: spirit.label,
  }));

  const adversaryOptions = ADVERSARIES.map((adv) => ({
    label: adv.name,
    subtext: adv.label,
    value: adv.label,
  }));

  const selectedAdversary = ADVERSARIES.find((adv) => adv.label === adversary);
  const adversaryLevelOptions = selectedAdversary
    ? Object.entries(selectedAdversary.levels).map(([level, data]) => ({
        label: data.name,
        subtext: `Level ${level}`,
        value: level,
      }))
    : [];

  const handleAdversaryChange = (adversaryLabel: string) => {
    setAdversary(adversaryLabel);
    // Reset difficulty to Base (level 0) when adversary changes
    setAdversaryLevel(0);
  };

  const clearAdversary = () => {
    setAdversary('');
    setAdversaryLevel(0);
  };

  const scenarioOptions = SCENARIOS.map((scenario) => ({
    label: scenario.name,
    subtext: `Difficulty ${scenario.difficulty}`,
    value: scenario.name,
  }));

  const selectedScenario = SCENARIOS.find((s) => s.name === scenario);

  const clearScenario = () => setScenario("")

  useEffect(() => {
    if (id) {
      loadExistingGame(parseInt(id, 10));
    }
  }, [id]);

  const loadExistingGame = async (gameIdToLoad: number) => {
    setInitialLoading(true);
    try {
      const game = await getGameById(gameIdToLoad);

      if (!game) {
        Alert.alert('Error', 'Game not found');
        router.back();
        return;
      }

      // Load all game data into form state
      setDate(new Date(game.date));
      setPlayers(game.players);

      // Map spirits to players
      const spiritsMap = game.players.reduce((acc, player, idx) => ({
        ...acc,
        [player]: game.spirits[idx] || '',
      }), {});
      setSpirits(spiritsMap);

      setWin(game.win);

      // Set adversary if present
      if (game.adversary) {
        // Try exact match first
        let adversaryData = ADVERSARIES.find(adv => adv.label === game.adversary);

        // If not found, try case-insensitive match
        if (!adversaryData) {
          adversaryData = ADVERSARIES.find(
            adv => adv.label.toLowerCase() === game.adversary?.toLowerCase()
          );
          if (adversaryData) {
            // Use the correct label from the static file
            setAdversary(adversaryData.label);
          } else {
            setAdversary('');
            setAdversaryLevel(0);
            return;
          }
        } else {
          setAdversary(game.adversary);
        }

        // Reverse lookup adversary level from difficulty
        if (game.adversaryDifficulty !== null && adversaryData) {
          const levelEntry = Object.entries(adversaryData.levels).find(
            ([_, data]) => data.difficulty === game.adversaryDifficulty
          );

          if (levelEntry) {
            const level = parseInt(levelEntry[0], 10);
            setAdversaryLevel(level);
          } else {
            setAdversaryLevel(0);
          }
        }
      } else {
        setAdversary('');
        setAdversaryLevel(0);
      }

      setScenario(game.scenario || '');
      setInvaderCards(game.invaderCards.toString());
      setDahan(game.dahan.toString());
      setBlight(game.blight.toString());
      setNotes(game.notes || '');
      setImages(game.pictures || []);

      // Store edit mode info
      setIsEditMode(true);
      setGameId(game.id);
      setExistingProfileId(game.profileId);
    } catch (error) {
      console.error('Error loading game:', error);
      Alert.alert('Error', 'Failed to load game data');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeProfile) {
      Alert.alert('Error', 'No active profile selected');
      return;
    }

    const playerList = players
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const spiritList = playerList.map((playerName) => spirits[playerName] || '').filter((s) => s.length > 0);

    if (playerList.length === 0 || spiritList.length === 0) {
      Alert.alert('Error', 'Please enter valid players and spirits');
      return;
    }

    if (playerList.length !== spiritList.length) {
      Alert.alert('Error', 'Please select a spirit for each player');
      return;
    }

    setLoading(true);
    try {
      let game;

      if (isEditMode && gameId) {
        // Update existing game
        game = await updateGame({
          id: gameId,
          profileId: existingProfileId!, // Use existing profile, don't change
          date: date.toISOString(),
          players: playerList,
          spirits: spiritList,
          win,
          adversary: adversary.trim() || null,
          adversaryDifficulty: selectedAdversary ? selectedAdversary.levels[adversaryLevel].difficulty : null,
          scenario: scenario.trim() || null,
          scenarioDifficulty: selectedScenario ? selectedScenario.difficulty : null,
          invaderCards: parseInt(invaderCards, 10) || 0,
          dahan: parseInt(dahan, 10) || 0,
          blight: parseInt(blight, 10) || 0,
          notes: notes.trim(),
          pictures: images,
        });
      } else {
        // Create new game
        game = await createGame({
          profileId: activeProfile.id,
          date: date.toISOString(),
          players: playerList,
          spirits: spiritList,
          win,
          adversary: adversary.trim() || null,
          adversaryDifficulty: selectedAdversary ? selectedAdversary.levels[adversaryLevel].difficulty : null,
          scenario: scenario.trim() || null,
          scenarioDifficulty: selectedScenario ? selectedScenario.difficulty : null,
          invaderCards: parseInt(invaderCards, 10) || 0,
          dahan: parseInt(dahan, 10) || 0,
          blight: parseInt(blight, 10) || 0,
          notes: notes.trim(),
          pictures: images,
        });
      }

      if (game) {
        router.replace(`/game/${game.id}?tab=stats`);
      } else {
        Alert.alert('Error', 'Failed to save game. Please try again.');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert('Error', 'Failed to save game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? 'Edit Game' : 'Add Game',
          presentation: 'modal',
        }}
      />
      <ThemedView style={styles.container}>
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading game data...</ThemedText>
          </View>
        ) : (
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
              {players.map((player, index) => (
                <View key={index} style={styles.playerInputRow}>
                  <TextInput
                    style={[styles.input, styles.playerInput]}
                    placeholder={`Player ${index + 1}`}
                    value={player}
                    onChangeText={(value) => updatePlayer(index, value)}
                  />
                  {players.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePlayer(index)}
                      style={styles.removeButton}
                    >
                      <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Button
                title="+ Add Player"
                onPress={addPlayerInput}
                variant="outline"
                style={styles.addButton}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Spirits *</ThemedText>
              {players.map((player, index) => {
                const playerName = player.trim();
                if (!playerName) return null;
                return (
                  <View key={index} style={styles.spiritSelectRow}>
                    <Select
                      label={playerName}
                      value={spirits[playerName] || ''}
                      onChange={(spiritName) => updateSpirit(playerName, spiritName)}
                      options={spiritOptions}
                      placeholder="Select a spirit"
                    />
                  </View>
                );
              })}
              {players.filter((p) => p.trim()).length === 0 && (
                <ThemedText style={styles.helperText}>
                  Add players above to select their spirits
                </ThemedText>
              )}
            </View>

            <View style={styles.switchField}>
              <ThemedText style={styles.label}>Victory</ThemedText>
              <Switch value={win} onValueChange={setWin} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Adversary</ThemedText>
              <View style={styles.adversaryRow}>
                <View style={styles.adversarySelect}>
                  <Select
                    value={adversary}
                    onChange={handleAdversaryChange}
                    options={adversaryOptions}
                    placeholder="Select an adversary (optional)"
                  />
                </View>
                  {adversary && (
                    <TouchableOpacity
                      onPress={clearAdversary}
                      style={styles.removeButton}
                    >
                      <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                  )}
              </View>
            </View>

            {adversary && (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Adversary Level</ThemedText>
                <Select
                  value={adversaryLevel.toString()}
                  onChange={(level) => setAdversaryLevel(parseInt(level, 10))}
                  options={adversaryLevelOptions}
                  placeholder="Select difficulty level"
                />
              </View>
            )}

            <View style={styles.field}>
              <ThemedText style={styles.label}>Scenario</ThemedText>
              <View style={styles.adversaryRow}>
                <View style={styles.adversarySelect}>
                  <Select
                    value={scenario}
                    onChange={setScenario}
                    options={scenarioOptions}
                    placeholder="Select a scenario (optional)"
                  />
                </View>
                {scenario && (
                  <TouchableOpacity
                    onPress={clearScenario}
                    style={styles.removeButton}
                  >
                    <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
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
              title={isEditMode ? 'Update Game' : 'Save Game'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 4,
  },
  spiritSelectRow: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  adversaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adversarySelect: {
    flex: 1,
  },
});
