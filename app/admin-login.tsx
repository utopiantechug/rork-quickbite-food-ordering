import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Shield, UserPlus } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useBakeryStore } from '@/store/bakery-store';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isInitialized } = useBakeryStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(username.trim(), password);
      
      if (user) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid Credentials', 'Please check your username and password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdmin = () => {
    router.push('/setup-admin');
  };

  // If no users exist, show setup option
  if (!isInitialized()) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Setup Required',
            headerLeft: () => (
              <Pressable onPress={handleBack}>
                <ArrowLeft size={24} color="#2D1810" />
              </Pressable>
            ),
          }}
        />
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <UserPlus size={64} color="#D4A574" />
            </View>
            
            <Text style={styles.title}>Setup Administrator</Text>
            <Text style={styles.subtitle}>
              No administrator account exists. Please create the first admin account to get started.
            </Text>

            <Pressable style={styles.setupButton} onPress={handleSetupAdmin}>
              <Text style={styles.setupButtonText}>Create Admin Account</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Staff Login',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
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
              autoCorrect={false}
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

          <Pressable 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </Pressable>
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  setupButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});