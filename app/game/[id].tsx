import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGames } from '@/hooks/useGames';
import { GameWithScore } from '@/types';

type TabType = 'game' | 'stats';

export default function GameDetailsScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const { getGameById, deleteGame } = useGames();
  const [game, setGame] = useState<GameWithScore | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(
    (tab as TabType) || 'game'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [id]);

  const loadGame = async () => {
    if (id) {
      setLoading(true);
      const gameData = await getGameById(parseInt(id, 10));
      setGame(gameData);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteGame(parseInt(id, 10));
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!game) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Game not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Game Details' }} />
      <ThemedView style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'game' && styles.activeTab]}
            onPress={() => setActiveTab('game')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'game' && styles.activeTabText,
              ]}
            >
              Game
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'stats' && styles.activeTabText,
              ]}
            >
              Stats
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {activeTab === 'game' ? (
            <View style={styles.content}>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Game Info</ThemedText>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Date:</ThemedText>
                  <ThemedText style={styles.value}>
                    {formatDate(game.date)}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Result:</ThemedText>
                  <View
                    style={[
                      styles.badge,
                      game.win ? styles.winBadge : styles.lossBadge,
                    ]}
                  >
                    <ThemedText style={styles.badgeText}>
                      {game.win ? 'Victory' : 'Defeat'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Score:</ThemedText>
                  <ThemedText style={styles.value}>{game.score}</ThemedText>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Players</ThemedText>
                <ThemedText style={styles.value}>
                  {game.players.join(', ')}
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Spirits</ThemedText>
                <ThemedText style={styles.value}>
                  {game.spirits.join(', ')}
                </ThemedText>
              </View>

              {game.adversary && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Adversary</ThemedText>
                  <ThemedText style={styles.value}>
                    {game.adversary}
                    {game.adversaryDifficulty !== null &&
                      ` (Difficulty ${game.adversaryDifficulty})`}
                  </ThemedText>
                </View>
              )}

              {game.scenario && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Scenario</ThemedText>
                  <ThemedText style={styles.value}>
                    {game.scenario}
                    {game.scenarioDifficulty !== null &&
                      ` (Difficulty ${game.scenarioDifficulty})`}
                  </ThemedText>
                </View>
              )}

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Game State</ThemedText>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Invader Cards:</ThemedText>
                  <ThemedText style={styles.value}>
                    {game.invaderCards}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Dahan Remaining:</ThemedText>
                  <ThemedText style={styles.value}>{game.dahan}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Blight on Island:</ThemedText>
                  <ThemedText style={styles.value}>{game.blight}</ThemedText>
                </View>
              </View>

              {game.notes && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
                  <ThemedText style={styles.value}>{game.notes}</ThemedText>
                </View>
              )}

              {game.pictures.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Photos</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.photosScroll}
                  >
                    {game.pictures.map((uri, index) => (
                      <Image
                        key={index}
                        source={{ uri }}
                        style={styles.photo}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <ThemedText style={styles.deleteButtonText}>
                  Delete Game
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.statsCard}>
                <ThemedText style={styles.scoreLabel}>Final Score</ThemedText>
                <ThemedText style={styles.scoreValue}>{game.score}</ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.infoText}>
                  Additional stats will go here
                </ThemedText>
              </View>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  winBadge: {
    backgroundColor: '#34C759',
  },
  lossBadge: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photosScroll: {
    marginTop: 8,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  statsCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    color: '#FF3B30',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
