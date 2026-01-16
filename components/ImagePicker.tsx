import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { ThemedText } from './ThemedText';
import { processAndSaveImage, deleteImage } from '@/lib/storage/imageStorage';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImagePicker({
  images,
  onImagesChange,
  maxImages = 5,
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ExpoImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const handleAddImage = async (source: 'camera' | 'library') => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera and photo library permissions are required to add images'
      );
      return;
    }

    setLoading(true);
    try {
      const result =
        source === 'camera'
          ? await ExpoImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            })
          : await ExpoImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 1,
            });

      if (!result.canceled && result.assets[0]) {
        const processedUri = await processAndSaveImage(result.assets[0].uri);
        onImagesChange([...images, processedUri]);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const imageToRemove = images[index];
          try {
            await deleteImage(imageToRemove);
            onImagesChange(images.filter((_, i) => i !== index));
          } catch (error) {
            console.error('Error removing image:', error);
          }
        },
      },
    ]);
  };

  const showAddOptions = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take Photo',
        onPress: () => handleAddImage('camera'),
      },
      {
        text: 'Choose from Library',
        onPress: () => handleAddImage('library'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        Photos ({images.length}/{maxImages})
      </ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imageList}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <ThemedText style={styles.removeButtonText}>×</ThemedText>
              </TouchableOpacity>
            </View>
          ))}

          {images.length < maxImages && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={showAddOptions}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <ThemedText style={styles.addButtonText}>+</ThemedText>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageList: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  addButtonText: {
    fontSize: 48,
    color: '#007AFF',
    lineHeight: 52,
  },
});
