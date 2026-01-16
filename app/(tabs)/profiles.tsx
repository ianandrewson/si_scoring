import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Profile } from '@/types';

const ALL_PROFILES_ITEM = {
  id: 0,
  name: 'All Profiles',
  createdAt: '',
  lastUsedAt: '',
};

export default function ProfilesScreen() {
  const { activeProfile, viewAllProfiles, switchProfile, setViewAllProfiles, createAndActivateProfile } = useApp();
  const { profiles } = useProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [loading, setLoading] = useState(false);

  const profileList = [ALL_PROFILES_ITEM, ...profiles];

  const handleProfileSelect = async (profile: Profile) => {
    if (profile.id === 0) {
      setViewAllProfiles(true);
    } else {
      setViewAllProfiles(false);
      await switchProfile(profile);
    }
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    setLoading(true);
    try {
      const profile = await createAndActivateProfile(newProfileName.trim());
      if (profile) {
        setNewProfileName('');
        setShowAddModal(false);
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

  const isSelected = (profile: Profile) => {
    if (profile.id === 0) {
      return viewAllProfiles;
    }
    return !viewAllProfiles && activeProfile?.id === profile.id;
  };

  const renderProfileItem = ({ item }: { item: Profile }) => {
    const selected = isSelected(item);
    return (
      <TouchableOpacity
        style={[styles.profileItem, selected && styles.selectedProfile]}
        onPress={() => handleProfileSelect(item)}
      >
        <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>{item.name}</ThemedText>
          {item.id !== 0 && (
            <ThemedText style={styles.profileDate}>
              Created {new Date(item.createdAt).toLocaleDateString()}
            </ThemedText>
          )}
        </View>
        {selected && (
          <View style={styles.checkmark}>
            <ThemedText style={styles.checkmarkText}>✓</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Profiles
        </ThemedText>
        <Button
          title="Add Profile"
          variant="outline"
          onPress={() => setShowAddModal(true)}
        />
      </View>

      <FlatList
        data={profileList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProfileItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              New Profile
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Enter profile name"
              value={newProfileName}
              onChangeText={setNewProfileName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddProfile}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowAddModal(false);
                  setNewProfileName('');
                }}
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleAddProfile}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedProfile: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileDate: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
