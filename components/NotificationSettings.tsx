import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { Bell, BellOff, Settings } from 'lucide-react-native';
import { 
  checkNotificationPermissions, 
  requestNotificationPermissions,
  NotificationPermissions 
} from '@/utils/notifications';

export function NotificationSettings() {
  const [permissions, setPermissions] = useState<NotificationPermissions>({
    granted: false,
    canAskAgain: false,
    status: 'denied' as any,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const currentPermissions = await checkNotificationPermissions();
      setPermissions(currentPermissions);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleToggleNotifications = async () => {
    if (permissions.granted) {
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device settings and turn off notifications for this app.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!permissions.canAskAgain) {
      Alert.alert(
        'Notifications Disabled',
        'Notifications are disabled. Please enable them in your device settings to receive order updates.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const newPermissions = await requestNotificationPermissions();
      setPermissions(newPermissions);
      
      if (newPermissions.granted) {
        Alert.alert(
          'Notifications Enabled',
          'You will now receive notifications when new orders are placed and when order status changes.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Notifications Denied',
          'You can enable notifications later in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {permissions.granted ? (
            <Bell size={24} color="#27AE60" />
          ) : (
            <BellOff size={24} color="#E74C3C" />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Order Notifications</Text>
          <Text style={styles.subtitle}>
            {permissions.granted 
              ? 'Get notified about new orders and status updates'
              : 'Enable notifications to stay updated on orders'
            }
          </Text>
        </View>
        <Switch
          value={permissions.granted}
          onValueChange={handleToggleNotifications}
          disabled={isLoading}
          trackColor={{ false: '#E8E8E8', true: '#27AE60' }}
          thumbColor={permissions.granted ? '#fff' : '#f4f3f4'}
        />
      </View>

      {!permissions.granted && permissions.canAskAgain && (
        <Pressable 
          style={styles.enableButton} 
          onPress={handleToggleNotifications}
          disabled={isLoading}
        >
          <Bell size={20} color="#fff" />
          <Text style={styles.enableButtonText}>
            {isLoading ? 'Requesting...' : 'Enable Notifications'}
          </Text>
        </Pressable>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>You'll be notified when:</Text>
        <Text style={styles.infoItem}>• New orders are placed</Text>
        <Text style={styles.infoItem}>• Orders are ready for pickup</Text>
        <Text style={styles.infoItem}>• Order status changes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5B73',
    lineHeight: 18,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 4,
  },
});