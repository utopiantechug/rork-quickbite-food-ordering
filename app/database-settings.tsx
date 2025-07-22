import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useDatabaseContext } from '@/store/database-provider';
import { Database, Cloud, Smartphone, Wifi, WifiOff, HardDrive, ExternalLink } from 'lucide-react-native';

export default function DatabaseSettingsScreen() {
  const { mode, setMode, isOnline } = useDatabaseContext();
  const [isChanging, setIsChanging] = useState(false);

  const handleModeChange = async (newMode: 'local' | 'supabase' | 'firebase') => {
    if (newMode === mode) return;

    Alert.alert(
      'Change Database',
      `Are you sure you want to switch to ${newMode === 'local' ? 'Local Storage' : newMode === 'supabase' ? 'Supabase' : 'Firebase'}?\n\nThis will reload your data from the selected source.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          style: 'destructive',
          onPress: async () => {
            setIsChanging(true);
            try {
              await setMode(newMode);
              Alert.alert('Success', 'Database switched successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to switch database. Please try again.');
            } finally {
              setIsChanging(false);
            }
          },
        },
      ]
    );
  };

  const DatabaseOption = ({ 
    type, 
    title, 
    description, 
    icon: Icon, 
    isSelected, 
    onPress 
  }: {
    type: 'local' | 'supabase' | 'firebase';
    title: string;
    description: string;
    icon: any;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      style={[styles.option, isSelected && styles.selectedOption]}
      onPress={onPress}
      disabled={isChanging}
    >
      <View style={styles.optionHeader}>
        <Icon size={24} color={isSelected ? '#007AFF' : '#666'} />
        <Text style={[styles.optionTitle, isSelected && styles.selectedText]}>
          {title}
        </Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Current</Text>
          </View>
        )}
      </View>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Database Settings' }} />
      
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Connection Status:</Text>
          <View style={styles.statusIndicator}>
            {isOnline ? (
              <>
                <Wifi size={16} color="#34C759" />
                <Text style={[styles.statusText, { color: '#34C759' }]}>Online</Text>
              </>
            ) : (
              <>
                <WifiOff size={16} color="#FF3B30" />
                <Text style={[styles.statusText, { color: '#FF3B30' }]}>Offline</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Choose Your Database</Text>
      <Text style={styles.sectionDescription}>
        Select where you want to store your bakery data. You can switch between options at any time.
      </Text>

      <DatabaseOption
        type="local"
        title="Local Storage"
        description="Store data locally on your device. Works offline but data won't sync across devices."
        icon={Smartphone}
        isSelected={mode === 'local'}
        onPress={() => handleModeChange('local')}
      />

      <DatabaseOption
        type="supabase"
        title="Supabase"
        description="Cloud database with real-time sync, authentication, and automatic backups. Requires internet connection."
        icon={Database}
        isSelected={mode === 'supabase'}
        onPress={() => handleModeChange('supabase')}
      />

      <DatabaseOption
        type="firebase"
        title="Firebase"
        description="Google's cloud database with real-time updates and offline support. Requires internet connection."
        icon={Cloud}
        isSelected={mode === 'firebase'}
        onPress={() => handleModeChange('firebase')}
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Setup Required</Text>
        <Text style={styles.infoText}>
          To use Supabase or Firebase, you need to:
          {'\n'}• Create an account with the service
          {'\n'}• Set up your project
          {'\n'}• Update the configuration in the app
          {'\n'}• Create the required database tables/collections
        </Text>
        
        <TouchableOpacity
          style={styles.setupGuideButton}
          onPress={() => router.push('/firebase-setup')}
        >
          <ExternalLink size={16} color="#FF6B35" />
          <Text style={styles.setupGuideText}>Firebase Setup Guide</Text>
        </TouchableOpacity>
      </View>

      {/* Backup Settings Link */}
      <TouchableOpacity
        style={styles.backupButton}
        onPress={() => router.push('/backup-settings')}
      >
        <HardDrive size={20} color="#8B4513" />
        <Text style={styles.backupButtonText}>Backup & Restore Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 20,
    lineHeight: 20,
  },
  option: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedText: {
    color: '#007AFF',
  },
  selectedBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B4513',
    justifyContent: 'center',
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 8,
  },
  setupGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setupGuideText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});