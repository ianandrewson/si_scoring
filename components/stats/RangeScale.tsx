/**
 * RangeScale - Visual scale component showing min/max/current values.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface RangeScaleProps {
  title: string;
  min: number;
  max: number;
  current: number;
  lowIsGood: boolean;
}

export const RangeScale = React.memo(({ title, min, max, current, lowIsGood }: RangeScaleProps) => {
  // Format number to show decimals only when needed
  const formatNumber = (value: number): string => {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  };

  // Handle case where all values are the same
  if (min === max) {
    return (
      <View style={styles.card}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.singleValueContainer}>
          <ThemedText style={styles.singleValueText}>All games: {formatNumber(current)}</ThemedText>
        </View>
      </View>
    );
  }

  const percentage = ((current - min) / (max - min)) * 100;

  // Color based on position and whether low is good
  const getColor = () => {
    if (lowIsGood) {
      // For blight: low (green) to high (red)
      if (percentage < 33) return '#34C759';
      if (percentage < 66) return '#FF9500';
      return '#FF3B30';
    } else {
      // For dahan: high (green) to low (red)
      if (percentage > 66) return '#34C759';
      if (percentage > 33) return '#FF9500';
      return '#FF3B30';
    }
  };

  const color = getColor();

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.scaleContainer}>
        <View style={styles.track} />
        <View
          style={[
            styles.indicator,
            {
              left: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.labelsContainer}>
        <ThemedText style={styles.label}>Min: {formatNumber(min)}</ThemedText>
        <ThemedText style={[styles.label, styles.currentLabel, { color }]}>
          Current: {formatNumber(current)}
        </ThemedText>
        <ThemedText style={styles.label}>Max: {formatNumber(max)}</ThemedText>
      </View>
    </View>
  );
});

RangeScale.displayName = 'RangeScale';

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
    marginBottom: 16,
  },
  scaleContainer: {
    height: 8,
    position: 'relative',
    marginBottom: 12,
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  indicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  currentLabel: {
    fontWeight: '600',
  },
  singleValueContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  singleValueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
  },
});
