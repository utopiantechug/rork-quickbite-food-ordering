import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupData } from '@/store/bakery-store';
import { FirebaseBackupService } from './firebase-backup';

export interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  lastBackup?: string;
  maxBackups: number;
}

const AUTO_BACKUP_KEY = 'auto_backup_settings';
const LAST_BACKUP_KEY = 'last_auto_backup';

export class AutoBackupService {
  private static defaultSettings: AutoBackupSettings = {
    enabled: false,
    frequency: 'weekly',
    maxBackups: 5,
  };

  static async getSettings(): Promise<AutoBackupSettings> {
    try {
      const stored = await AsyncStorage.getItem(AUTO_BACKUP_KEY);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Error getting auto backup settings:', error);
      return this.defaultSettings;
    }
  }

  static async updateSettings(settings: Partial<AutoBackupSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating auto backup settings:', error);
      throw new Error('Failed to update backup settings');
    }
  }

  static async shouldCreateBackup(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.enabled) {
        return false;
      }

      if (settings.frequency === 'manual') {
        return false;
      }

      const lastBackupStr = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      if (!lastBackupStr) {
        return true; // No backup exists, create one
      }

      const lastBackup = new Date(lastBackupStr);
      const now = new Date();
      const hoursSinceLastBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

      if (settings.frequency === 'daily') {
        return hoursSinceLastBackup >= 24;
      } else if (settings.frequency === 'weekly') {
        return hoursSinceLastBackup >= 24 * 7;
      }

      return false;
    } catch (error) {
      console.error('Error checking if backup should be created:', error);
      return false;
    }
  }

  static async createAutoBackup(backupData: BackupData): Promise<string | null> {
    try {
      const shouldBackup = await this.shouldCreateBackup();
      if (!shouldBackup) {
        return null;
      }

      // Create backup in Firebase
      const backupId = await FirebaseBackupService.createBackup(backupData);
      
      // Update last backup timestamp
      await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      return backupId;
    } catch (error) {
      console.error('Error creating auto backup:', error);
      throw new Error('Failed to create automatic backup');
    }
  }

  static async cleanupOldBackups(): Promise<void> {
    try {
      const settings = await this.getSettings();
      const backups = await FirebaseBackupService.listBackups();
      
      // Sort by timestamp (newest first)
      const sortedBackups = backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Delete backups beyond the max limit
      if (sortedBackups.length > settings.maxBackups) {
        const backupsToDelete = sortedBackups.slice(settings.maxBackups);
        
        for (const backup of backupsToDelete) {
          try {
            await FirebaseBackupService.deleteBackup(backup.id);
          } catch (error) {
            console.error(`Failed to delete backup ${backup.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  static async getLastBackupInfo(): Promise<{ date: Date; id: string } | null> {
    try {
      const lastBackupStr = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      if (!lastBackupStr) {
        return null;
      }

      const backups = await FirebaseBackupService.listBackups();
      if (backups.length === 0) {
        return null;
      }

      const latestBackup = backups[0]; // Already sorted by date desc
      return {
        date: new Date(latestBackup.timestamp),
        id: latestBackup.id,
      };
    } catch (error) {
      console.error('Error getting last backup info:', error);
      return null;
    }
  }

  static async initializeAutoBackup(createBackup: () => BackupData): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) {
        return;
      }

      // Check if we should create a backup
      const shouldBackup = await this.shouldCreateBackup();
      if (shouldBackup) {
        const backupData = createBackup();
        await this.createAutoBackup(backupData);
        console.log('Auto backup created successfully');
      }
    } catch (error) {
      console.error('Error initializing auto backup:', error);
    }
  }
}