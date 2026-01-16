import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GameCard } from '@/components/GameCard';
import { useApp } from '@/contexts/AppContext';
import { useGames } from '@/hooks/useGames';

export default function HomeScreen() {
  const { activeProfile, viewAllProfiles } = useApp();
  const profileId = viewAllProfiles ? undefined : activeProfile?.id;
  const { games, loading, fetchGames } = useGames(profileId);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [activeProfile, viewAllProfiles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  };

  const handleAddGame = () => {
    router.push('/add-game');
  };

  const handleGamePress = (gameId: number) => {
    router.push(`/game/${gameId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No games yet
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Tap the + button to record your first game
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => handleGamePress(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          games.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddGame}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 36,
  },
});
