import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react-native';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Use a more reliable endpoint for network checking
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        // Try multiple endpoints for better reliability
        const endpoints = [
          'https://httpbin.org/status/200',
          'https://www.google.com/favicon.ico',
          'https://api.github.com'
        ];
        
        let success = false;
        for (const endpoint of endpoints) {
          try {
            await fetch(endpoint, {
              method: 'HEAD',
              mode: 'no-cors',
              signal: controller.signal,
            });
            success = true;
            break;
          } catch (e) {
            // Try next endpoint
            continue;
          }
        }
        
        clearTimeout(timeoutId);
        
        if (success) {
          setIsOnline(true);
          setLastError(null);
        } else {
          throw new Error('All endpoints failed');
        }
      } catch (error) {
        console.warn('Network check failed:', error);
        setIsOnline(false);
        
        if (error instanceof Error) {
          if (error.message.includes('Remote update request not successful') ||
              error.message.includes('Failed to download remote update')) {
            setLastError('Update check failed');
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
    
    // Check every 30 seconds (less frequent to avoid spam)
    const interval = setInterval(checkNetwork, 30000);

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
      // For update errors, hide after 10 seconds
      if (lastError?.includes('Update check failed')) {
        const timer = setTimeout(() => setShowStatus(false), 10000);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastError]);

  if (!showStatus) return null;

  const getStatusMessage = () => {
    if (isOnline && !lastError) return 'Back online';
    if (lastError?.includes('Update check failed')) return 'App working normally (update check failed)';
    if (lastError) return lastError;
    return 'No internet connection';
  };

  const getStatusColor = () => {
    if (isOnline && !lastError) return '#27AE60';
    if (lastError?.includes('Update check failed')) return '#F39C12';
    return '#E74C3C';
  };

  const getStatusIcon = () => {
    if (isOnline && !lastError) return <Wifi size={16} color="#fff" />;
    if (lastError?.includes('Update check failed')) return <AlertTriangle size={16} color="#fff" />;
    return <WifiOff size={16} color="#fff" />;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      {getStatusIcon()}
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