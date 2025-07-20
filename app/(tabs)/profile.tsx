import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogOut, Settings, User, Shield, Package, Plus, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBakeryStore } from '@/store/bakery-store';

export default function ProfileScreen() {
  const { user, logout } = useBakeryStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/admin-login');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Shield size={64} color="#D4A574" />
          <Text style={styles.loginTitle}>Staff Portal</Text>
          <Text style={styles.loginText}>Please login to access staff features</Text>
          <Pressable style={styles.loginButton} onPress={() => router.push('/admin-login')}>
            <Text style={styles.loginButtonText}>Staff Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Shield size={32} color="#D4A574" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Bakery Staff</Text>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuItem} onPress={() => router.push('/admin')}>
          <Settings size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Order Management</Text>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={() => router.push('/products')}>
          <Package size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Product Management</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/customers')}>
          <Users size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Customer Management</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/order-form')}>
          <Plus size={24} color="#6B5B73" />
          <Text style={styles.menuText}>Create New Order</Text>
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={24} color="#E74C3C" />
          <Text style={[styles.menuText, { color: '#E74C3C' }]}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#6B5B73',
  },
  menu: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D1810',
    marginLeft: 16,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
    marginTop: 24,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});