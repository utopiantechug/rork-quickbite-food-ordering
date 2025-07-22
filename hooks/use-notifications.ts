import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { 
  requestNotificationPermissions, 
  setupNotificationCategories,
  handleNotificationResponse,
  setBadgeCount
} from '@/utils/notifications';
import { useBakeryStore } from '@/store/bakery-store';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const useNotifications = () => {
  const { orders, currentUser } = useBakeryStore();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeNotifications = async () => {
      try {
        // Skip notification setup in Expo Go for push notifications
        if (isExpoGo) {
          console.log('Running in Expo Go - limited notification support');
          return;
        }

        // Request permissions
        const permissions = await requestNotificationPermissions();
        
        if (!permissions.granted) {
          console.warn('Notification permissions not granted');
          return;
        }

        // Setup notification categories (mobile only)
        if (Platform.OS !== 'web') {
          await setupNotificationCategories();
        }

        // Set up notification listeners (mobile only, not in Expo Go)
        if (Platform.OS !== 'web' && permissions.granted) {
          // Only set up listeners if we have proper notification support
          try {
            // Listen for notifications received while app is foregrounded
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
              console.log('Notification received:', notification);
            });

            // Listen for user interactions with notifications
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
              handleNotificationResponse(response);
              
              // Navigate to admin screen when notification is tapped
              const { orderId } = response.notification.request.content.data || {};
              if (orderId && currentUser) {
                router.push('/admin');
              }
            });
          } catch (error) {
            console.warn('Failed to set up notification listeners:', error);
          }
        }

        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    if (isMounted) {
      initializeNotifications();
    }

    return () => {
      isMounted = false;
      
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [currentUser]);

  // Update badge count based on pending orders
  useEffect(() => {
    const updateBadgeCount = async () => {
      try {
        if (currentUser) {
          const pendingOrdersCount = orders.filter(order => 
            order.status === 'pending' || order.status === 'preparing'
          ).length;
          
          await setBadgeCount(pendingOrdersCount);
        } else {
          await setBadgeCount(0);
        }
      } catch (error) {
        console.error('Error updating badge count:', error);
      }
    };

    updateBadgeCount();
  }, [orders, currentUser]);

  return {
    requestPermissions: requestNotificationPermissions,
  };
};