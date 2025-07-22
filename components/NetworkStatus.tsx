import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Use a more reliable endpoint for network checking
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://httpbin.org/status/200', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        setIsOnline(true);
        setLastError(null);
      } catch (error) {
        console.warn('Network check failed:', error);
        setIsOnline(false);
        
        if (error instanceof Error) {
          if (error.message.includes('Remote update request not successful')) {
            setLastError('Remote update failed');
          } else if (error.name === 'AbortError') {
            setLastError('Connection timeout');
          } else {
            setLastError('Network error');
          }
        }
      }
    };

    // Initial check
    checkNetwork();
    
    // Check every 15 seconds
    const interval = setInterval(checkNetwork, 15000);

    // Listen for network state changes on web
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsOnline(true);
        setLastError(null);
        checkNetwork();
      };
      const handleOffline = () => {
        setIsOnline(false);
        setLastError('Offline');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOnline || lastError) {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastError]);

  if (!showStatus) return null;

  const getStatusMessage = () => {
    if (isOnline && !lastError) return 'Back online';
    if (lastError) return lastError;
    return 'No internet connection';
  };

  return (
    <View style={[styles.container, { backgroundColor: isOnline && !lastError ? '#27AE60' : '#E74C3C' }]}>
      {isOnline && !lastError ? <Wifi size={16} color="#fff" /> : <WifiOff size={16} color="#fff" />}
      <Text style={styles.text}>
        {getStatusMessage()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});