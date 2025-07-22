import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogOut, Settings, User, Shield, Package, Plus, Users, RotateCcw, Download, Upload, Database, UserCog } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBakeryStore } from '@/store/bakery-store';
import { createBackupFile, selectAndReadBackupFile, getBackupInfo } from '@/utils/backup-restore';

export default function ProfileScreen() {
  const { currentUser, logout, resetData, createBackup, restoreFromBackup, validateBackup } = useBakeryStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/admin-login');
          }
        }
      ]
    );
  };

  const handleBackup = async () => {
    try {
      const backupData = createBackup();
      const fileName = await createBackupFile(backupData);
      
      Alert.alert(
        'Backup Created',
        `Backup file has been created successfully!

File: ${fileName.includes('/') ? fileName.split('/').pop() : fileName}
Data: ${backupData.data.products.length} products, ${backupData.data.orders.length} orders, ${backupData.data.customers.length} customers, ${backupData.data.users.length} users`
      );
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert(
        'Backup Failed',
        error instanceof Error ? error.message : 'Failed to create backup'
      );
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Data',
      'This will replace all current data with the backup data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            try {
              const backupData = await selectAndReadBackupFile();
              
              if (!validateBackup(backupData)) {
                Alert.alert('Invalid Backup', 'The selected file is not a valid backup file.');
                return;
              }
              
              const info = getBackupInfo(backupData);
              
              Alert.alert(
                'Confirm Restore',
                `Restore data from backup?

Backup Date: ${info.date}
Version: ${info.version}

Data to restore:
• ${info.productsCount} products
• ${info.ordersCount} orders
• ${info.customersCount} customers
• ${backupData.data.users.length} users${info.hasUser ? '\n• Current user session' : ''}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await restoreFromBackup(backupData);
                        Alert.alert(
                          'Restore Complete',
                          'Data has been successfully restored from backup!'
                        );
                      } catch (error) {
                        console.error('Restore error:', error);
                        Alert.alert(
                          'Restore Failed',
                          error instanceof Error ? error.message : 'Failed to restore backup'
                        );
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('File selection error:', error);
              if (error instanceof Error && error.message !== 'File selection cancelled') {
                Alert.alert(
                  'File Error',
                  error.message === 'Invalid backup file format' 
                    ? 'The selected file is not a valid backup file.'
                    : 'Failed to read the backup file. Please try again.'
                );
              }
            }
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all orders, customers, and custom products. User accounts will be preserved. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetData();
            Alert.alert('Success', 'All data has been reset to defaults (users preserved)');
          }
        }
      ]
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Shield size={64} color="#D4A574" />
          <Text style={styles.loginTitle}>Staff Portal</Text>
          <Text style={styles.loginText}>Please login to access staff features</Text>
          <Pressable style={styles.loginButton} onPress={() => router.push('/admin-login')}>
            <Text style={styles.loginButtonText}>Staff Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {currentUser.role === 'admin' ? (
            <Shield size={32} color="#D4A574" />
          ) : (
            <User size={32} color="#D4A574" />
          )}
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.role}>
          {currentUser.role === 'admin' ? 'Administrator' : 'Staff Member'}
        </Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuItem} onPress={() => router.push('/admin')}>
          <Settings size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Order Management</Text>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={() => router.push('/products')}>
          <Package size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Product Management</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/customers')}>
          <Users size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Customer Management</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/order-form')}>
          <Plus size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Create New Order</Text>
        </Pressable>

        {currentUser.role === 'admin' && (
          <>
            <View style={styles.divider} />
            
            <View style={styles.sectionHeader}>
              <UserCog size={20} color="#D4A574" />
              <Text style={styles.sectionTitle}>Administration</Text>
            </View>

            <Pressable style={styles.menuItem} onPress={() => router.push('/user-management')}>
              <UserCog size={24} color="#3498DB" />
              <Text style={[styles.menuText, { color: '#3498DB' }]}>User Management</Text>
            </Pressable>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Database size={20} color="#D4A574" />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>

        <Pressable style={styles.menuItem} onPress={handleBackup}>
          <Download size={24} color="#27AE60" />
          <Text style={[styles.menuText, { color: '#27AE60' }]}>Create Backup</Text>
        </Pressable>

        {currentUser.role === 'admin' && (
          <>
            <Pressable style={styles.menuItem} onPress={handleRestore}>
              <Upload size={24} color="#3498DB" />
              <Text style={[styles.menuText, { color: '#3498DB' }]}>Restore from Backup</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handleResetData}>
              <RotateCcw size={24} color="#F39C12" />
              <Text style={[styles.menuText, { color: '#F39C12' }]}>Reset All Data</Text>
            </Pressable>
          </>
        )}
        
        <View style={styles.divider} />
        
        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={24} color="#E74C3C" />
          <Text style={[styles.menuText, { color: '#E74C3C' }]}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💾 Use backup to save your data before major changes
        </Text>
        <Text style={styles.footerText}>
          Data is automatically saved and will persist between app updates
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '500',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#6B5B73',
  },
  menu: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D1810',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
    marginTop: 24,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B5B73',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
});