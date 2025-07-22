import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Plus, Edit, Trash2, Shield, User, UserCheck, UserX } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useBakeryStore } from '@/store/bakery-store';
import { User as UserType } from '@/types';

export default function UserManagementScreen() {
  const { users, currentUser, deleteUser, updateUser } = useBakeryStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleDeleteUser = (user: UserType) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.name}" (${user.username})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            try {
              deleteUser(user.id);
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const handleToggleUserStatus = (user: UserType) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} "${user.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: () => {
            updateUser(user.id, { isActive: !user.isActive });
            Alert.alert('Success', `User ${action}d successfully`);
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderUserCard = ({ item: user }: { item: UserType }) => {
    const isCurrentUser = currentUser?.id === user.id;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            {user.role === 'admin' ? (
              <Shield size={24} color="#D4A574" />
            ) : (
              <User size={24} color="#6B5B73" />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {isCurrentUser && (
                <View style={styles.currentUserBadge}>
                  <Text style={styles.currentUserText}>You</Text>
                </View>
              )}
            </View>
            <Text style={styles.userUsername}>@{user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <View style={styles.userActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/user-form?id=${user.id}`)}
            >
              <Edit size={18} color="#3498DB" />
            </Pressable>
            {!isCurrentUser && (
              <Pressable
                style={styles.actionButton}
                onPress={() => handleDeleteUser(user)}
              >
                <Trash2 size={18} color="#E74C3C" />
              </Pressable>
            )}
          </View>
        </View>
        
        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Role:</Text>
            <View style={[
              styles.roleBadge,
              { backgroundColor: user.role === 'admin' ? '#D4A574' : '#6B5B73' }
            ]}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status:</Text>
            <Pressable
              style={[
                styles.statusBadge,
                { backgroundColor: user.isActive ? '#27AE60' : '#E74C3C' }
              ]}
              onPress={() => !isCurrentUser && handleToggleUserStatus(user)}
              disabled={isCurrentUser}
            >
              {user.isActive ? (
                <UserCheck size={14} color="#fff" />
              ) : (
                <UserX size={14} color="#fff" />
              )}
              <Text style={styles.statusText}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>{formatDate(user.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
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
          title: 'User Management',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/user-form')}>
              <Plus size={24} color="#D4A574" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'staff').length}
            </Text>
            <Text style={styles.statLabel}>Staff</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <FlatList
          data={users.sort((a, b) => {
            // Sort by role (admin first), then by creation date
            if (a.role !== b.role) {
              return a.role === 'admin' ? -1 : 1;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
          })}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B5B73',
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
    marginRight: 8,
  },
  currentUserBadge: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentUserText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B5B73',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B5B73',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    color: '#2D1810',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
  },
});