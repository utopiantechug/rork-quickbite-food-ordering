import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Order } from '@/types';
import { formatCurrency } from '@/utils/currency';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior only if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('Failed to configure notification handler:', error);
  }
}

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

export const requestNotificationPermissions = async (): Promise<NotificationPermissions> => {
  try {
    if (Platform.OS === 'web') {
      // For web, use browser notification API
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return {
          granted: permission === 'granted',
          canAskAgain: permission === 'default',
          status: permission as any,
        };
      }
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as any,
      };
    }

    // Check if running in Expo Go
    if (isExpoGo) {
      console.warn('Push notifications are not supported in Expo Go. Use a development build for full notification support.');
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as any,
      };
    }

    // For mobile devices
    if (!Device.isDevice) {
      console.warn('Notifications only work on physical devices');
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as any,
      };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return {
      granted: finalStatus === 'granted',
      canAskAgain: existingStatus === 'undetermined',
      status: finalStatus,
    };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied' as any,
    };
  }
};

export const checkNotificationPermissions = async (): Promise<NotificationPermissions> => {
  try {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        return {
          granted: Notification.permission === 'granted',
          canAskAgain: Notification.permission === 'default',
          status: Notification.permission as any,
        };
      }
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as any,
      };
    }

    // Check if running in Expo Go
    if (isExpoGo) {
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as any,
      };
    }

    const { status } = await Notifications.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status === 'undetermined',
      status,
    };
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied' as any,
    };
  }
};

export const sendNewOrderNotification = async (order: Order): Promise<void> => {
  try {
    const permissions = await checkNotificationPermissions();
    
    if (!permissions.granted) {
      console.warn('Notification permissions not granted');
      return;
    }

    const title = '🥖 New Order Received!';
    const body = `Order #${order.id} from ${order.customerName} - ${formatCurrency(order.total)}`;
    
    if (Platform.OS === 'web') {
      // For web, use browser notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `order-${order.id}`,
          requireInteraction: true,
          data: {
            orderId: order.id,
            type: 'new_order',
          },
        });
      }
    } else if (!isExpoGo) {
      // For mobile, use expo-notifications (only if not in Expo Go)
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'order',
          data: {
            orderId: order.id,
            type: 'new_order',
          },
        },
        trigger: null, // Show immediately
      });
    } else {
      // Fallback for Expo Go - just log the notification
      console.log(`📱 New Order Notification: ${title} - ${body}`);
    }
  } catch (error) {
    console.error('Error sending new order notification:', error);
  }
};

export const sendOrderStatusNotification = async (
  order: Order, 
  newStatus: Order['status']
): Promise<void> => {
  try {
    const permissions = await checkNotificationPermissions();
    
    if (!permissions.granted) {
      console.warn('Notification permissions not granted');
      return;
    }

    const statusMessages = {
      pending: 'Order received and is pending',
      preparing: 'Order is being prepared',
      ready: 'Order is ready for pickup! 🎉',
      completed: 'Order has been completed',
      cancelled: 'Order has been cancelled',
    };

    const title = `Order #${order.id} Update`;
    const body = `${order.customerName}'s order: ${statusMessages[newStatus]}`;
    
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `order-status-${order.id}`,
          data: {
            orderId: order.id,
            type: 'status_update',
            status: newStatus,
          },
        });
      }
    } else if (!isExpoGo) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: newStatus === 'ready' ? 'default' : undefined,
          priority: newStatus === 'ready' 
            ? Notifications.AndroidNotificationPriority.HIGH 
            : Notifications.AndroidNotificationPriority.DEFAULT,
          categoryIdentifier: 'order_status',
          data: {
            orderId: order.id,
            type: 'status_update',
            status: newStatus,
          },
        },
        trigger: null,
      });
    } else {
      // Fallback for Expo Go - just log the notification
      console.log(`📱 Order Status Notification: ${title} - ${body}`);
    }
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
};

export const setupNotificationCategories = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      // Web doesn't need categories setup, and Expo Go doesn't support them
      return;
    }

    await Notifications.setNotificationCategoryAsync('order', [
      {
        identifier: 'view_order',
        buttonTitle: 'View Order',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'mark_preparing',
        buttonTitle: 'Start Preparing',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('order_status', [
      {
        identifier: 'view_order',
        buttonTitle: 'View Order',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  } catch (error) {
    console.error('Error setting up notification categories:', error);
  }
};

export const handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
  try {
    const { notification, actionIdentifier } = response;
    const { orderId, type } = notification.request.content.data || {};

    console.log('Notification response:', {
      orderId,
      type,
      actionIdentifier,
    });

    // Handle different notification actions
    switch (actionIdentifier) {
      case 'view_order':
        // Navigate to order details or admin screen
        // This would need to be implemented with navigation
        console.log('Navigate to order:', orderId);
        break;
      case 'mark_preparing':
        // Update order status to preparing
        // This would need to be implemented with store actions
        console.log('Mark order as preparing:', orderId);
        break;
      default:
        // Default tap action
        console.log('Default notification tap:', orderId);
        break;
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
};

export const clearAllNotifications = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      // Web notifications are automatically managed by the browser
      // Expo Go doesn't support notification management
      return;
    }

    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

export const getBadgeCount = async (): Promise<number> => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      return 0; // Web doesn't support badge count, neither does Expo Go
    }

    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    if (Platform.OS === 'web' || isExpoGo) {
      return; // Web doesn't support badge count, neither does Expo Go
    }

    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};