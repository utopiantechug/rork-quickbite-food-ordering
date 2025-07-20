import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useBakeryStore } from '@/store/bakery-store';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useBakeryStore(state => state.login);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both username and password');
      return;
    }

    // Simple admin credentials for demo
    if (username === 'admin' && password === 'bakery123') {
      login(true, 'Admin User');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Invalid Credentials', 'Please check your username and password');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Staff Login',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Shield size={64} color="#D4A574" />
          </View>
          
          <Text style={styles.title}>Staff Portal</Text>
          <Text style={styles.subtitle}>Login to access the admin dashboard</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#6B5B73"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#6B5B73"
              secureTextEntry
            />
          </View>

          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Username: admin</Text>
            <Text style={styles.demoText}>Password: bakery123</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D1810',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D1810',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoCredentials: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#6B5B73',
    fontFamily: 'monospace',
  },
});