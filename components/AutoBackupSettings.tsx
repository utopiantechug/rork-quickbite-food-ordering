import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AutoBackupService, AutoBackupSettings } from '@/utils/auto-backup';
import { useBakeryStore } from '@/store/bakery-store';
import { Clock, Calendar, Settings, Info } from 'lucide-react-native';

export default function AutoBackupSettingsComponent() {
  const { createBackup } = useBakeryStore();
  const [settings, setSettings] = useState<AutoBackupSettings>({
    enabled: false,
    frequency: 'weekly',
    maxBackups: 5,
  });
  const [loading, setLoading] = useState(true);
  const [lastBackupInfo, setLastBackupInfo] = useState<{ date: Date; id: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadLastBackupInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await AutoBackupService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load auto backup settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLastBackupInfo = async () => {
    try {
      const info = await AutoBackupService.getLastBackupInfo();
      setLastBackupInfo(info);
    } catch (error) {
      console.error('Failed to load last backup info:', error);
    }
  };

  const updateSetting = async (key: keyof AutoBackupSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AutoBackupService.updateSettings({ [key]: value });
      
      // If enabling auto backup, initialize it
      if (key === 'enabled' && value === true) {
        await AutoBackupService.initializeAutoBackup(createBackup);
        await loadLastBackupInfo();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update backup settings');
      console.error('Failed to update setting:', error);
    }
  };

  const handleManualBackup = async () => {
    try {
      setLoading(true);
      const backupData = createBackup();
      const backupId = await AutoBackupService.createAutoBackup(backupData);
      
      if (backupId) {
        Alert.alert('Success', 'Manual backup created successfully!');
        await loadLastBackupInfo();
      } else {
        Alert.alert('Info', 'No backup needed at this time');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create manual backup');
      console.error('Manual backup error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B4513" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings size={20} color="#8B4513" />
        <Text style={styles.title}>Auto Backup Settings</Text>
      </View>

      {/* Enable/Disable Auto Backup */}
      <View style={styles.setting}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Enable Auto Backup</Text>
          <Text style={styles.settingDescription}>
            Automatically backup your data to Firebase
          </Text>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={(value) => updateSetting('enabled', value)}
          trackColor={{ false: '#ccc', true: '#8B4513' }}
          thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {settings.enabled && (
        <>
          {/* Backup Frequency */}
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Backup Frequency</Text>
              <Text style={styles.settingDescription}>
                How often to create automatic backups
              </Text>
            </View>
          </View>

          <View style={styles.frequencyOptions}>
            {[
              { value: 'daily', label: 'Daily', icon: Clock },
              { value: 'weekly', label: 'Weekly', icon: Calendar },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  settings.frequency === option.value && styles.selectedOption,
                ]}
                onPress={() => updateSetting('frequency', option.value)}
              >
                <option.icon
                  size={20}
                  color={settings.frequency === option.value ? '#8B4513' : '#666'}
                />
                <Text
                  style={[
                    styles.frequencyLabel,
                    settings.frequency === option.value && styles.selectedLabel,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Max Backups */}
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Keep Backups</Text>
              <Text style={styles.settingDescription}>
                Maximum number of backups to keep (older ones will be deleted)
              </Text>
            </View>
          </View>

          <View style={styles.maxBackupsOptions}>
            {[3, 5, 10, 15].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.maxBackupOption,
                  settings.maxBackups === count && styles.selectedOption,
                ]}
                onPress={() => updateSetting('maxBackups', count)}
              >
                <Text
                  style={[
                    styles.maxBackupLabel,
                    settings.maxBackups === count && styles.selectedLabel,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Last Backup Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Info size={16} color="#666" />
              <Text style={styles.infoTitle}>Last Backup</Text>
            </View>
            <Text style={styles.infoText}>
              {lastBackupInfo
                ? `${lastBackupInfo.date.toLocaleDateString()} at ${lastBackupInfo.date.toLocaleTimeString()}`
                : 'No automatic backups yet'}
            </Text>
          </View>

          {/* Manual Backup Button */}
          <TouchableOpacity
            style={styles.manualBackupButton}
            onPress={handleManualBackup}
            disabled={loading}
          >
            <Text style={styles.manualBackupText}>Create Backup Now</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  frequencyOptions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    borderColor: '#8B4513',
    backgroundColor: '#fff',
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  selectedLabel: {
    color: '#8B4513',
    fontWeight: '600',
  },
  maxBackupsOptions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  maxBackupOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  maxBackupLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  manualBackupButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualBackupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});