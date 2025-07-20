import { FlatList, StyleSheet, Text, View } from 'react-native';
import { OrderCard } from '@/components/OrderCard';
import { useBakeryStore } from '@/store/bakery-store';

export default function OrdersScreen() {
  const { orders, user } = useBakeryStore();
  
  const userOrders = user?.isAdmin ? orders : orders.filter(order => order.customerName === user?.name);

  if (userOrders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          Your orders will appear here once you place them
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