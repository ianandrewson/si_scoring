import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MEDIA_DIR = `${FileSystem.documentDirectory}media/`;

async function ensureMediaDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
}

export async function processAndSaveImage(uri: string): Promise<string> {
  try {
    await ensureMediaDirectory();

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const destination = `${MEDIA_DIR}${filename}`;

    await FileSystem.moveAsync({
      from: manipulatedImage.uri,
      to: destination,
    });

    return destination;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

export async function deleteImage(filePath: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export async function deleteAllGameImages(filePaths: string[]): Promise<void> {
  try {
    await Promise.all(filePaths.map((filePath) => deleteImage(filePath)));
  } catch (error) {
    console.error('Error deleting game images:', error);
  }
}
