import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Linking } from 'react-native';
import { useBakeryStore } from '@/store/bakery-store';
import {
  createBackupFile,
  selectAndReadBackupFile,
  getBackupInfo,
  backupToFirebase,
  restoreFromFirebase,
  listFirebaseBackups,
  deleteFirebaseBackup,
} from '@/utils/backup-restore';
import { FirebaseBackupMetadata } from '@/utils/firebase-backup';
import { Download, Upload, Cloud, CloudOff, Trash2, RefreshCw, HardDrive, Settings, AlertTriangle, ExternalLink, Info } from 'lucide-react-native';
import AutoBackupSettingsComponent from '@/components/AutoBackupSettings';

export default function BackupSettings() {
  const { createBackup, restoreFromBackup, validateBackup } = useBakeryStore();
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseBackups, setFirebaseBackups] = useState<FirebaseBackupMetadata[]>([]);
  const [loadingFirebaseBackups, setLoadingFirebaseBackups] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    checkFirebaseConfiguration();
  }, []);

  const checkFirebaseConfiguration = async () => {
    try {
      // First check if Firebase is configured with real credentials
      const { FirebaseBackupService } = await import('@/utils/firebase-backup');
      
      if (!FirebaseBackupService.isConfigured()) {
        setFirebaseConfigured(false);
        setFirebaseError('Firebase not configured. Please set up your Firebase credentials.');
        return;
      }

      // Try to list backups to check if Firebase connection works
      await listFirebaseBackups();
      setFirebaseConfigured(true);
      setFirebaseError(null);
      loadFirebaseBackups();
    } catch (error) {
      setFirebaseConfigured(false);
      if (error instanceof Error) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('Firebase connection failed. Please check your configuration.');
      }
    }
  };

  const loadFirebaseBackups = async () => {
    if (!firebaseConfigured) return;
    
    setLoadingFirebaseBackups(true);
    try {
      const backups = await listFirebaseBackups();
      setFirebaseBackups(backups);
      setFirebaseError(null);
    } catch (error) {
      console.error('Failed to load Firebase backups:', error);
      setFirebaseError('Failed to load cloud backups. Please check your connection.');
    } finally {
      setLoadingFirebaseBackups(false);
    }
  };

  const handleCreateLocalBackup = async () => {
    setIsLoading(true);
    try {
      const backupData = createBackup();
      const filePath = await createBackupFile(backupData);
      
      Alert.alert(
        'Backup Created',
        Platform.OS === 'web' 
          ? 'Backup file has been downloaded to your device.'
          : `Backup saved successfully. You can share or save the file from the sharing dialog.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup file. Please try again.');
      console.error('Backup creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreLocalBackup = async () => {
    try {
      setIsLoading(true);
      const backupData = await selectAndReadBackupFile();
      
      if (!validateBackup(backupData)) {
        Alert.alert('Invalid Backup', 'The selected file is not a valid backup file.');
        return;
      }

      const info = getBackupInfo(backupData);
      
      Alert.alert(
        'Restore Backup',
        `This will restore data from ${info.date}\n\n` +
        `Products: ${info.productsCount}\n` +
        `Orders: ${info.ordersCount}\n` +
        `Customers: ${info.customersCount}\n\n` +
        'This will replace all current data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await restoreFromBackup(backupData);
                Alert.alert('Success', 'Data restored successfully!');
              } catch (error) {
                Alert.alert('Error', 'Failed to restore backup. Please try again.');
                console.error('Restore error:', error);
              }
            },
          },
        ]
      );
    } catch (error) {
      if (error instanceof Error && error.message !== 'File selection cancelled') {
        Alert.alert('Error', 'Failed to read backup file. Please check the file and try again.');
        console.error('Restore file reading error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseBackup = async () => {
    if (!firebaseConfigured) {
      Alert.alert(
        'Firebase Not Configured',
        'Please set up Firebase first to use cloud backup features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Setup Guide', onPress: () => router.push('/firebase-setup') }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const backupData = createBackup();
      const backupId = await backupToFirebase(backupData);
      
      Alert.alert(
        'Firebase Backup Created',
        `Your data has been backed up to Firebase.\nBackup ID: ${backupId.slice(0, 8)}...`,
        [{ text: 'OK' }]
      );
      
      await loadFirebaseBackups();
    } catch (error) {
      Alert.alert('Error', 'Failed to backup to Firebase. Please check your internet connection and try again.');
      console.error('Firebase backup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseRestore = async (backupId: string, timestamp: string) => {
    Alert.alert(
      'Restore from Firebase',
      `This will restore data from ${new Date(timestamp).toLocaleDateString()}\n\n` +
      'This will replace all current data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const backupData = await restoreFromFirebase(backupId);
              await restoreFromBackup(backupData);
              Alert.alert('Success', 'Data restored from Firebase successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore from Firebase. Please try again.');
              console.error('Firebase restore error:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteFirebaseBackup = async (backupId: string, timestamp: string) => {
    Alert.alert(
      'Delete Backup',
      `Delete backup from ${new Date(timestamp).toLocaleDateString()}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFirebaseBackup(backupId);
              Alert.alert('Success', 'Backup deleted successfully!');
              await loadFirebaseBackups();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete backup. Please try again.');
              console.error('Firebase delete error:', error);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backup & Restore',
          headerStyle: { backgroundColor: '#8B4513' },
          headerTintColor: '#fff',
        }} 
      />

      {/* Local Backup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <HardDrive size={24} color="#8B4513" />
          <Text style={styles.sectionTitle}>Local Backup</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Create and restore backups on your device
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCreateLocalBackup}
          disabled={isLoading}
        >
          <Download size={20} color="#fff" />
          <Text style={styles.buttonText}>Create Local Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRestoreLocalBackup}
          disabled={isLoading}
        >
          <Upload size={20} color="#8B4513" />
          <Text style={[styles.buttonText, { color: '#8B4513' }]}>Restore from File</Text>
        </TouchableOpacity>
      </View>

      {/* Auto Backup Section */}
      <View style={styles.section}>
        <AutoBackupSettingsComponent />
      </View>

      {/* Firebase Backup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Cloud size={24} color="#8B4513" />
          <Text style={styles.sectionTitle}>Firebase Cloud Backup</Text>
          {firebaseConfigured && (
            <TouchableOpacity
              onPress={loadFirebaseBackups}
              disabled={loadingFirebaseBackups}
              style={styles.refreshButton}
            >
              <RefreshCw 
                size={20} 
                color="#8B4513" 
                style={loadingFirebaseBackups ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionDescription}>
          Backup your data to Firebase cloud storage for safe keeping
        </Text>

        {!firebaseConfigured && (
          <View style={styles.configurationWarning}>
            <AlertTriangle size={20} color="#f39c12" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Firebase Setup Required</Text>
              <Text style={styles.warningText}>
                {firebaseError || 'Firebase is not configured. Set up Firebase to enable cloud backup features.'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button, 
              firebaseConfigured ? styles.primaryButton : styles.disabledButton
            ]}
            onPress={handleFirebaseBackup}
            disabled={isLoading || !firebaseConfigured}
          >
            <Cloud size={20} color={firebaseConfigured ? "#fff" : "#999"} />
            <Text style={[
              styles.buttonText, 
              { color: firebaseConfigured ? "#fff" : "#999" }
            ]}>
              Backup to Firebase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/firebase-setup')}
          >
            <Settings size={20} color="#8B4513" />
            <Text style={[styles.buttonText, { color: '#8B4513' }]}>
              Setup Guide
            </Text>
          </TouchableOpacity>
        </View>

        {/* Firebase Backups List */}
        {firebaseConfigured && (
          <View style={styles.backupsList}>
            <Text style={styles.backupsTitle}>Cloud Backups</Text>
            
            {loadingFirebaseBackups ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B4513" />
                <Text style={styles.loadingText}>Loading backups...</Text>
              </View>
            ) : firebaseError ? (
              <View style={styles.errorState}>
                <AlertTriangle size={48} color="#dc3545" />
                <Text style={styles.errorText}>Failed to load backups</Text>
                <Text style={styles.errorSubtext}>{firebaseError}</Text>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, { marginTop: 12 }]}
                  onPress={checkFirebaseConfiguration}
                >
                  <RefreshCw size={16} color="#8B4513" />
                  <Text style={[styles.buttonText, { color: '#8B4513', fontSize: 14 }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : firebaseBackups.length === 0 ? (
              <View style={styles.emptyState}>
                <CloudOff size={48} color="#ccc" />
                <Text style={styles.emptyText}>No cloud backups found</Text>
                <Text style={styles.emptySubtext}>Create your first backup above</Text>
              </View>
            ) : (
              firebaseBackups.map((backup) => (
                <View key={backup.id} style={styles.backupItem}>
                  <View style={styles.backupInfo}>
                    <Text style={styles.backupDate}>
                      {new Date(backup.timestamp).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.backupDetails}>
                      Version {backup.version} • {formatFileSize(backup.size)}
                    </Text>
                    {backup.deviceId && (
                      <Text style={styles.deviceId}>
                        Device: {backup.deviceId.slice(0, 8)}...
                      </Text>
                    )}
                  </View>
                  <View style={styles.backupActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleFirebaseRestore(backup.id, backup.timestamp)}
                      disabled={isLoading}
                    >
                      <Download size={16} color="#8B4513" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteFirebaseBackup(backup.id, backup.timestamp)}
                      disabled={isLoading}
                    >
                      <Trash2 size={16} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingOverlayText}>Processing...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  backupsList: {
    marginTop: 20,
  },
  backupsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backupDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceId: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  backupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    borderColor: '#dc3545',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  configurationWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});