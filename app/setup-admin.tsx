import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useBakeryStore } from '@/store/bakery-store';

export default function SetupAdminScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { initializeAdmin, login } = useBakeryStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/admin-login');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSetup = async () => {
    if (!username.trim() || !password.trim() || !name.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize admin user
      initializeAdmin({
        username: username.trim(),
        password: password,
        name: name.trim(),
        email: email.trim(),
      });

      // Auto-login the new admin
      await login(username.trim(), password);

      Alert.alert(
        'Setup Complete!',
        'Administrator account has been created successfully. You are now logged in.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Setup Error', 'Failed to create administrator account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Setup Administrator',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={64} color="#D4A574" />
          </View>
          
          <Text style={styles.title}>Create Administrator</Text>
          <Text style={styles.subtitle}>
            Set up the first administrator account for OvenTreats UG
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#6B5B73"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#6B5B73"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username (min 3 characters)"
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
              placeholder="Choose a password (min 6 characters)"
              placeholderTextColor="#6B5B73"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#6B5B73"
              secureTextEntry
            />
          </View>

          <Pressable 
            style={[styles.setupButton, isLoading && styles.setupButtonDisabled]} 
            onPress={handleSetup}
            disabled={isLoading}
          >
            <Text style={styles.setupButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Administrator Account'}
            </Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Important:</Text>
            <Text style={styles.infoText}>
              • This will be the main administrator account
            </Text>
            <Text style={styles.infoText}>
              • You can create additional staff accounts later
            </Text>
            <Text style={styles.infoText}>
              • Keep your credentials secure
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: 40,
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
  setupButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  setupButtonDisabled: {
    opacity: 0.6,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 4,
  },
});