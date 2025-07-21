import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Simple network check
    const checkNetwork = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showStatus) return null;

  return (
    <View style={[styles.container, { backgroundColor: isOnline ? '#27AE60' : '#E74C3C' }]}>
      {isOnline ? <Wifi size={16} color="#fff" /> : <WifiOff size={16} color="#fff" />}
      <Text style={styles.text}>
        {isOnline ? 'Back online' : 'No internet connection'}
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