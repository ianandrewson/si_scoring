import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameWithScore } from '@/types';

interface GameCardProps {
  game: GameWithScore;
  onPress: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(game.date)}</Text>
        <View style={[styles.badge, game.win ? styles.winBadge : styles.lossBadge]}>
          <Text style={styles.badgeText}>{game.win ? 'Victory' : 'Defeat'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.spirits} numberOfLines={1}>
          {game.spirits.join(', ')}
        </Text>
        <Text style={styles.details}>
          {game.players.length} player{game.players.length > 1 ? 's' : ''} • Score: {game.score}
        </Text>
        {game.adversary && (
          <Text style={styles.adversary} numberOfLines={1}>
            vs {game.adversary}
            {game.adversaryDifficulty !== null && ` (${game.adversaryDifficulty})`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 4,
  },
  spirits: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  adversary: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
