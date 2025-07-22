import { FlatList, StyleSheet, Text, View } from 'react-native';
import { OrderCard } from '@/components/OrderCard';
import { useBakeryStore } from '@/store/bakery-store';

export default function OrdersScreen() {
  const { orders, currentUser } = useBakeryStore();
  
  // Show all orders for staff/admin, or filter for customers (though customers don't have accounts in this system)
  const userOrders = currentUser ? orders : [];

  if (userOrders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          {currentUser 
            ? 'Orders will appear here once they are created'
            : 'Please login to view orders'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1EB',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    lineHeight: 24,
  },
});