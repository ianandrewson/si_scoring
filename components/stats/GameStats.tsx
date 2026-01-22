/**
 * GameStats - Main statistics component for game details screen.
 * Displays comprehensive statistics comparing the current game to profile games.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { GameWithScore } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useGames } from '@/hooks/useGames';
import { StatCard } from './StatCard';
import { RangeScale } from './RangeScale';
import { WinLossRecord } from './WinLossRecord';
import {
  getHighestScore,
  getOverallRank,
  getSameDifficultyRank,
  getBlightStats,
  getDahanStats,
  getSameAdversaryDifficultyRecord,
  getSameAdversaryRecord,
  getSameSpiritsRecord,
  getSameSpiritsAndAdversaryRecord,
  getSpiritComboScoreStats,
} from '@/lib/stats/gameComparison';

interface GameStatsProps {
  game: GameWithScore;
}

export const GameStats = ({ game }: GameStatsProps) => {
  const { activeProfile, viewAllProfiles } = useApp();
  const profileId = viewAllProfiles ? undefined : activeProfile?.id;
  const { games: allGames, loading } = useGames(profileId);

  // Filter out the current game from comparisons
  const comparisonGames = useMemo(
    () => allGames.filter(g => g.id !== game.id),
    [allGames, game.id]
  );

  // Calculate all statistics using useMemo for performance
  const stats = useMemo(() => {
    if (comparisonGames.length === 0) {
      return null;
    }

    return {
      highestScore: getHighestScore(comparisonGames),
      overallRank: getOverallRank(game, comparisonGames),
      difficultyRank: getSameDifficultyRank(game, comparisonGames),
      blightStats: getBlightStats(game, comparisonGames),
      dahanStats: getDahanStats(game, comparisonGames),
      sameAdversaryDifficultyRecord: getSameAdversaryDifficultyRecord(game, comparisonGames),
      sameAdversaryRecord: getSameAdversaryRecord(game, comparisonGames),
      sameSpiritsRecord: getSameSpiritsRecord(game, comparisonGames),
      sameSpiritsAndAdversaryRecord: getSameSpiritsAndAdversaryRecord(game, comparisonGames),
      spiritComboScoreStats: getSpiritComboScoreStats(game, comparisonGames),
    };
  }, [game, comparisonGames]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.messageText}>Loading statistics...</ThemedText>
      </View>
    );
  }

  // Show message if this is the first game
  if (comparisonGames.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.scoreCard}>
          <ThemedText style={styles.scoreLabel}>Final Score</ThemedText>
          <ThemedText style={styles.scoreValue}>{game.score}</ThemedText>
        </View>
        <View style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            This is your first game! Play more to see comparison statistics.
          </ThemedText>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.messageText}>Unable to load statistics</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Score Hero Card */}
      <View style={styles.scoreCard}>
        <ThemedText style={styles.scoreLabel}>Final Score</ThemedText>
        <ThemedText style={styles.scoreValue}>{game.score}</ThemedText>
      </View>

      {/* Rankings Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Rankings</ThemedText>
        <StatCard
          title="Overall Rank"
          value={`#${stats.overallRank.rank}`}
          subtitle={`out of ${stats.overallRank.total} games`}
        />
        {stats.difficultyRank && (
          <StatCard
            title="Rank at Difficulty"
            value={`#${stats.difficultyRank.rank}`}
            subtitle={`out of ${stats.difficultyRank.total} at difficulty ${stats.difficultyRank.difficulty}`}
          />
        )}
      </View>

      {/* Score Context Section */}
      {stats.highestScore && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Score Context</ThemedText>
          <StatCard
            title="Highest Score"
            value={stats.highestScore.score.toString()}
            subtitle={`Spirits: ${stats.highestScore.spirits.join(', ')}`}
          />
        </View>
      )}

      {/* Game State Scales Section */}
      {(stats.blightStats || stats.dahanStats) && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Game State</ThemedText>
          {stats.blightStats && (
            <RangeScale
              title="Blight on Island Per Player"
              min={stats.blightStats.min}
              max={stats.blightStats.max}
              current={stats.blightStats.current}
              lowIsGood={true}
            />
          )}
          {stats.dahanStats && (
            <RangeScale
              title="Dahan Remaining Per Player"
              min={stats.dahanStats.min}
              max={stats.dahanStats.max}
              current={stats.dahanStats.current}
              lowIsGood={false}
            />
          )}
        </View>
      )}

      {/* Win/Loss Records Section */}
      {(stats.sameAdversaryDifficultyRecord ||
        stats.sameAdversaryRecord ||
        stats.sameSpiritsRecord ||
        stats.sameSpiritsAndAdversaryRecord) && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Win/Loss Records</ThemedText>

          {stats.sameAdversaryDifficultyRecord && game.adversary && (
            <WinLossRecord
              title={`vs ${game.adversary} (Difficulty ${game.adversaryDifficulty})`}
              wins={stats.sameAdversaryDifficultyRecord.wins}
              losses={stats.sameAdversaryDifficultyRecord.losses}
            />
          )}

          {stats.sameAdversaryRecord && game.adversary && (
            <WinLossRecord
              title={`vs ${game.adversary} (Any Difficulty)`}
              wins={stats.sameAdversaryRecord.wins}
              losses={stats.sameAdversaryRecord.losses}
            />
          )}

          {stats.sameSpiritsRecord && (
            <WinLossRecord
              title="With Same Spirits (Any Difficulty)"
              wins={stats.sameSpiritsRecord.wins}
              losses={stats.sameSpiritsRecord.losses}
              subtitle={game.spirits.join(', ')}
            />
          )}

          {stats.sameSpiritsAndAdversaryRecord && game.adversary && (
            <WinLossRecord
              title={`Same Spirits vs ${game.adversary} (Any Difficulty)`}
              wins={stats.sameSpiritsAndAdversaryRecord.wins}
              losses={stats.sameSpiritsAndAdversaryRecord.losses}
            />
          )}
        </View>
      )}

      {/* Spirit Combo Stats Section */}
      {stats.spiritComboScoreStats && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Spirit Combo Performance</ThemedText>
          <StatCard
            title="Score Range with This Combo"
            value={`${stats.spiritComboScoreStats.low} - ${stats.spiritComboScoreStats.high}`}
            subtitle={`Average: ${stats.spiritComboScoreStats.average}`}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 18,
    paddingBottom: 8,
    color: '#fff',
    opacity: 0.9,
  },
  scoreValue: {
    fontSize: 48,
    paddingTop: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#11181C',
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
