import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BackupData } from '@/store/bakery-store';

export interface FirebaseBackupMetadata {
  id: string;
  timestamp: string;
  version: string;
  deviceId?: string;
  size: number;
}

export class FirebaseBackupService {
  private static COLLECTION_NAME = 'app_backups';

  static isConfigured(): boolean {
    try {
      // Check if Firebase app is initialized with real config
      const app = db.app;
      const config = app.options;
      
      // Check if config contains placeholder values
      const hasPlaceholders = 
        config.apiKey?.includes('YOUR_') ||
        config.projectId?.includes('YOUR_') ||
        config.authDomain?.includes('YOUR_') ||
        config.apiKey === 'YOUR_API_KEY' ||
        config.projectId === 'YOUR_PROJECT_ID';
        
      return !hasPlaceholders && !!config.apiKey && !!config.projectId;
    } catch (error) {
      return false;
    }
  }

  static async createBackup(backupData: BackupData): Promise<string> {
    try {
      const backupDoc = {
        ...backupData,
        createdAt: Timestamp.now(),
        deviceId: await this.getDeviceId(),
        size: JSON.stringify(backupData).length,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), backupDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating Firebase backup:', error);
      throw new Error('Failed to create backup in Firebase');
    }
  }

  static async getBackup(backupId: string): Promise<BackupData> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, backupId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Backup not found');
      }

      const data = docSnap.data();
      
      // Remove Firebase-specific fields and return the backup data
      const { createdAt, deviceId, size, ...backupData } = data;
      return backupData as BackupData;
    } catch (error) {
      console.error('Error getting Firebase backup:', error);
      throw new Error('Failed to retrieve backup from Firebase');
    }
  }

  static async listBackups(): Promise<FirebaseBackupMetadata[]> {
    try {
      // Check if Firebase is properly configured
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp,
          version: data.version,
          deviceId: data.deviceId,
          size: data.size,
        };
      });
    } catch (error: any) {
      console.error('Error listing Firebase backups:', error);
      
      // Check for common configuration errors
      if (error?.code === 'permission-denied') {
        throw new Error('Firebase access denied. Please check your Firestore security rules.');
      } else if (error?.code === 'unavailable') {
        throw new Error('Firebase service unavailable. Please check your internet connection.');
      } else if (error?.message?.includes('YOUR_API_KEY') || error?.message?.includes('YOUR_PROJECT_ID')) {
        throw new Error('Firebase not configured. Please set up your Firebase credentials.');
      } else {
        throw new Error('Failed to list backups from Firebase');
      }
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, backupId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting Firebase backup:', error);
      throw new Error('Failed to delete backup from Firebase');
    }
  }

  static async syncToFirebase(backupData: BackupData): Promise<string> {
    try {
      // Check if a recent backup exists (within last 24 hours)
      const backups = await this.listBackups();
      const deviceId = await this.getDeviceId();
      
      const recentBackup = backups.find(backup => {
        const backupTime = new Date(backup.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - backupTime.getTime()) / (1000 * 60 * 60);
        return backup.deviceId === deviceId && hoursDiff < 24;
      });

      if (recentBackup) {
        // Update existing backup
        await this.deleteBackup(recentBackup.id);
      }

      // Create new backup
      return await this.createBackup(backupData);
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      throw new Error('Failed to sync backup to Firebase');
    }
  }

  static async getLatestBackup(): Promise<BackupData | null> {
    try {
      const backups = await this.listBackups();
      if (backups.length === 0) {
        return null;
      }

      const latestBackup = backups[0]; // Already sorted by createdAt desc
      return await this.getBackup(latestBackup.id);
    } catch (error) {
      console.error('Error getting latest Firebase backup:', error);
      return null;
    }
  }

  private static async getDeviceId(): Promise<string> {
    try {
      // Try to get a unique device identifier
      // For web, use a combination of user agent and screen info
      // For mobile, you could use expo-device or generate a UUID
      if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Device fingerprint', 2, 2);
          return canvas.toDataURL().slice(-50); // Use last 50 chars as ID
        }
      }
      
      // Fallback: generate a random ID and store it
      let deviceId = localStorage?.getItem('deviceId');
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage?.setItem('deviceId', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      // Ultimate fallback
      return 'unknown_device_' + Date.now();
    }
  }
}