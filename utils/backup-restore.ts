import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { BackupData } from '@/store/bakery-store';
import { FirebaseBackupService } from './firebase-backup';

export const createBackupFile = async (backupData: BackupData): Promise<string> => {
  try {
    const fileName = `oventreats-backup-${new Date().toISOString().split('T')[0]}.json`;
    const backupJson = JSON.stringify(backupData, null, 2);
    
    if (Platform.OS === 'web') {
      // For web, create a downloadable file
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return fileName; // Return filename for success message
    } else {
      // For mobile, save to documents directory
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, backupJson);
      
      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup File',
        });
      }
      
      return fileUri;
    }
  } catch (error) {
    console.error('Backup file creation error:', error);
    throw new Error('Failed to create backup file');
  }
};

export const selectAndReadBackupFile = async (): Promise<BackupData> => {
  try {
    if (Platform.OS === 'web') {
      // For web, use file input
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }
          
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid backup file format'));
          }
        };
        input.click();
      });
    } else {
      // For mobile, use document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        throw new Error('File selection cancelled');
      }
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData = JSON.parse(fileContent);
      
      return backupData;
    }
  } catch (error) {
    console.error('File selection/reading error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to read backup file');
  }
};

export const getBackupInfo = (backupData: BackupData) => {
  const date = new Date(backupData.timestamp);
  const formattedDate = date.toLocaleDateString('en-UG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return {
    version: backupData.version,
    date: formattedDate,
    productsCount: backupData.data.products.length,
    ordersCount: backupData.data.orders.length,
    customersCount: backupData.data.customers.length,
    hasUser: !!backupData.data.currentUser,
  };
};

// Firebase backup functions
export const backupToFirebase = async (backupData: BackupData): Promise<string> => {
  try {
    const backupId = await FirebaseBackupService.createBackup(backupData);
    return backupId;
  } catch (error) {
    console.error('Firebase backup error:', error);
    throw new Error('Failed to backup to Firebase');
  }
};

export const restoreFromFirebase = async (backupId: string): Promise<BackupData> => {
  try {
    const backupData = await FirebaseBackupService.getBackup(backupId);
    return backupData;
  } catch (error) {
    console.error('Firebase restore error:', error);
    throw new Error('Failed to restore from Firebase');
  }
};

export const listFirebaseBackups = async (): Promise<Array<{id: string, timestamp: string, version: string}>> => {
  try {
    return await FirebaseBackupService.listBackups();
  } catch (error) {
    console.error('Firebase list backups error:', error);
    throw new Error('Failed to list Firebase backups');
  }
};

export const deleteFirebaseBackup = async (backupId: string): Promise<void> => {
  try {
    await FirebaseBackupService.deleteBackup(backupId);
  } catch (error) {
    console.error('Firebase delete backup error:', error);
    throw new Error('Failed to delete Firebase backup');
  }
};