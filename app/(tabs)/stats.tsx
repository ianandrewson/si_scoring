import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useApp } from '@/contexts/AppContext';

export default function StatsScreen() {
  const { activeProfile, viewAllProfiles } = useApp();

  const getDisplayName = () => {
    if (viewAllProfiles) {
      return 'All Profiles';
    }
    return activeProfile?.name || 'No Profile Selected';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Statistics
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {getDisplayName()}
          </ThemedText>
        </View>

        <View style={styles.placeholderCard}>
          <ThemedText style={styles.placeholderIcon}>📊</ThemedText>
          <ThemedText type="subtitle" style={styles.placeholderTitle}>
            Stats Coming Soon
          </ThemedText>
          <ThemedText style={styles.placeholderText}>
            Game statistics and analytics will be displayed here
          </ThemedText>
        </View>

        <View style={styles.statsPreview}>
          <ThemedText style={styles.previewTitle}>
            Future stats will include:
          </ThemedText>
          <View style={styles.previewList}>
            <ThemedText style={styles.previewItem}>• Total games played</ThemedText>
            <ThemedText style={styles.previewItem}>• Win/loss ratio</ThemedText>
            <ThemedText style={styles.previewItem}>• Average score</ThemedText>
            <ThemedText style={styles.previewItem}>• Favorite spirits</ThemedText>
            <ThemedText style={styles.previewItem}>• Most played adversaries</ThemedText>
            <ThemedText style={styles.previewItem}>• Score trends over time</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  statsPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewList: {
    gap: 12,
  },
  previewItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
