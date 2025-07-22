import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch } from 'react-native';
import { ArrowLeft, Shield, User } from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useBakeryStore } from '@/store/bakery-store';

export default function UserFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { users, currentUser, registerUser, updateUser } = useBakeryStore();
  
  const isEditing = !!id;
  const existingUser = isEditing ? users.find(u => u.id === id) : null;

  const [username, setUsername] = useState(existingUser?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(existingUser?.name || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [role, setRole] = useState<'admin' | 'staff'>(existingUser?.role || 'staff');
  const [isActive, setIsActive] = useState(existingUser?.isActive ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/user-management');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!username.trim() || !name.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please fill in username, name, and email');
      return;
    }

    if (!isEditing && !password.trim()) {
      Alert.alert('Missing Information', 'Please enter a password for the new user');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && id) {
        const updateData: any = {
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          role,
          isActive,
        };
        
        // Only update password if provided
        if (password) {
          updateData.password = password;
        }
        
        updateUser(id, updateData);
        Alert.alert('Success', 'User updated successfully', [
          { text: 'OK', onPress: handleBack }
        ]);
      } else {
        registerUser({
          username: username.trim(),
          password: password,
          name: name.trim(),
          email: email.trim(),
          role,
          isActive,
        });
        Alert.alert('Success', 'User created successfully', [
          { text: 'OK', onPress: handleBack }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can access this screen
  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access denied. Admin privileges required.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit User' : 'Add User',
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
            {role === 'admin' ? (
              <Shield size={48} color="#D4A574" />
            ) : (
              <User size={48} color="#6B5B73" />
            )}
          </View>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit User Account' : 'Create New User'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
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
              placeholder="Enter email address"
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
              placeholder="Enter username (min 3 characters)"
              placeholderTextColor="#6B5B73"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {isEditing ? 'New Password (leave empty to keep current)' : 'Password'}
            </Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password (min 6 characters)'}
              placeholderTextColor="#6B5B73"
              secureTextEntry
            />
          </View>

          {password.length > 0 && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#6B5B73"
                secureTextEntry
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleContainer}>
              <Pressable
                style={[
                  styles.roleButton,
                  role === 'staff' && styles.roleButtonActive
                ]}
                onPress={() => setRole('staff')}
              >
                <User size={20} color={role === 'staff' ? '#fff' : '#6B5B73'} />
                <Text style={[
                  styles.roleButtonText,
                  role === 'staff' && styles.roleButtonTextActive
                ]}>
                  Staff
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.roleButton,
                  role === 'admin' && styles.roleButtonActive
                ]}
                onPress={() => setRole('admin')}
              >
                <Shield size={20} color={role === 'admin' ? '#fff' : '#6B5B73'} />
                <Text style={[
                  styles.roleButtonText,
                  role === 'admin' && styles.roleButtonTextActive
                ]}>
                  Admin
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Account Status</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#E8E8E8', true: '#D4A574' }}
                thumbColor={isActive ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <Pressable 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update User' : 'Create User')
              }
            </Text>
          </Pressable>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1810',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
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
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B5B73',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    marginBottom: 32,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  switchLabel: {
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
  },
});