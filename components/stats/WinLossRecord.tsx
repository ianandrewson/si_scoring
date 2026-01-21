/**
 * WinLossRecord - Component for displaying win/loss records with visual progress bar.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface WinLossRecordProps {
  title: string;
  wins: number;
  losses: number;
  subtitle?: string;
}

export const WinLossRecord = React.memo(({ title, wins, losses, subtitle }: WinLossRecordProps) => {
  const total = wins + losses;

  // Handle zero-game case
  if (total === 0) {
    return (
      <View style={styles.card}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.noGamesText}>No games found</ThemedText>
      </View>
    );
  }

  const winPercentage = (wins / total) * 100;

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.recordContainer}>
        <ThemedText style={styles.record}>
          {wins}-{losses}
        </ThemedText>
        <ThemedText style={styles.percentage}>
          ({winPercentage.toFixed(0)}%)
        </ThemedText>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.winBar,
            { width: `${winPercentage}%` },
          ]}
        />
        <View
          style={[
            styles.lossBar,
            { width: `${100 - winPercentage}%` },
          ]}
        />
      </View>

      {subtitle && (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      )}
    </View>
  );
});

WinLossRecord.displayName = 'WinLossRecord';

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
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  record: {
    fontSize: 24,
    fontWeight: '600',
    color: '#11181C',
    marginRight: 8,
  },
  percentage: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  winBar: {
    backgroundColor: '#34C759',
  },
  lossBar: {
    backgroundColor: '#FF3B30',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  noGamesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
