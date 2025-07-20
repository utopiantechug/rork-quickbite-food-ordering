import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, User, Mail, Phone, Calendar, DollarSign, Package } from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useBakeryStore } from '@/store/bakery-store';
import { OrderCard } from '@/components/OrderCard';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, orders } = useBakeryStore();
  
  const customer = customers.find(c => c.id === id);
  const customerOrders = orders.filter(order => 
    order.customerEmail === customer?.email
  ).sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

  if (!customer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  const getAverageOrderValue = () => {
    if (customerOrders.length === 0) return 0;
    return customer.totalSpent / customer.totalOrders;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: customer.name,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.customerHeader}>
          <View style={styles.avatar}>
            <User size={32} color="#D4A574" />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={styles.contactInfo}>
              <Mail size={16} color="#6B5B73" />
              <Text style={styles.contactText}>{customer.email}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Phone size={16} color="#6B5B73" />
              <Text style={styles.contactText}>{customer.phone}</Text>
            </View>
            {customer.lastOrderDate && (
              <View style={styles.contactInfo}>
                <Calendar size={16} color="#6B5B73" />
                <Text style={styles.contactText}>
                  Last order: {customer.lastOrderDate.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color="#D4A574" />
            <Text style={styles.statNumber}>{customer.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#D4A574" />
            <Text style={styles.statNumber}>${customer.totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#D4A574" />
            <Text style={styles.statNumber}>${getAverageOrderValue().toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Order</Text>
          </View>
        </View>

        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Order History ({customerOrders.length})</Text>
          {customerOrders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Text style={styles.emptyOrdersText}>No orders found for this customer</Text>
            </View>
          ) : (
            <FlatList
              data={customerOrders}
              renderItem={({ item }) => <OrderCard order={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  customerHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  customerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#6B5B73',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    color: '#2D1810',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B5B73',
    fontWeight: '500',
    textAlign: 'center',
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 16,
  },
  emptyOrders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
  },
});