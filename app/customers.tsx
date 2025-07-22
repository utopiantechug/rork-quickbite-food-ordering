import { FlatList, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { ArrowLeft, Search, User, Mail, Phone, Calendar, DollarSign } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState, useMemo } from 'react';
import { useBakeryStore } from '@/store/bakery-store';
import { Customer } from '@/types';

export default function CustomersScreen() {
  const { customers } = useBakeryStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  }, [customers, searchQuery]);

  const renderCustomerCard = ({ item: customer }: { item: Customer }) => (
    <Pressable
      style={styles.customerCard}
      onPress={() => router.push(`/customer-details?id=${customer.id}`)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.avatar}>
          <User size={24} color="#D4A574" />
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <View style={styles.contactInfo}>
            <Mail size={14} color="#6B5B73" />
            <Text style={styles.contactText}>{customer.email}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Phone size={14} color="#6B5B73" />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.customerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customer.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${customer.totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : 'Never'}
          </Text>
          <Text style={styles.statLabel}>Last Order</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Customer Management',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{customers.length}</Text>
            <Text style={styles.statLabel}>Total Customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B5B73" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search customers..."
              placeholderTextColor="#6B5B73"
            />
          </View>
        </View>

        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={64} color="#D4A574" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Customers will appear here once orders are created'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers.sort((a, b) => {
              if (!a.lastOrderDate && !b.lastOrderDate) return 0;
              if (!a.lastOrderDate) return 1;
              if (!b.lastOrderDate) return -1;
              return b.lastOrderDate.getTime() - a.lastOrderDate.getTime();
            })}
            renderItem={renderCustomerCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B5B73',
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1810',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B5B73',
    marginLeft: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  statItem: {
    alignItems: 'center',
  },
});